const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/AppError');

const prisma = new PrismaClient();

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
};

/**
 * Get all tasks for a project with optional filters.
 */
const getByProject = async (projectId, filters, userId, role) => {
  // Check project exists
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  // Build where clause
  const where = { projectId };

  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.priority) {
    where.priority = filters.priority;
  }
  if (filters.assigneeId) {
    where.assignedToId = filters.assigneeId;
  }
  if (filters.search) {
    where.title = { contains: filters.search, mode: 'insensitive' };
  }

  // Members can only see tasks assigned to them or that they created
  if (role === 'MEMBER') {
    where.OR = [
      { assignedToId: userId },
      { createdById: userId },
    ];
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignedTo: { select: userSelect },
      createdBy: { select: userSelect },
      project: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return { tasks };
};

/**
 * Create a new task in a project (Admin only).
 */
const create = async (projectId, data, createdById) => {
  // Check project exists
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  // If assignedToId is provided, verify the user is a project member
  if (data.assignedToId) {
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: data.assignedToId } },
    });
    if (!member) {
      throw new AppError('Assigned user is not a member of this project.', 400);
    }
  }

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description || '',
      status: data.status || 'TODO',
      priority: data.priority || 'MEDIUM',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      projectId,
      assignedToId: data.assignedToId || null,
      createdById,
    },
    include: {
      assignedTo: { select: userSelect },
      createdBy: { select: userSelect },
      project: { select: { id: true, name: true } },
    },
  });

  return { task };
};

/**
 * Update a task (Admin can update everything, member is restricted).
 */
const update = async (taskId, data, userId, role) => {
  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  });

  if (!existing) {
    throw new AppError('Task not found.', 404);
  }

  // Members can only update status of their own assigned tasks
  if (role === 'MEMBER') {
    if (existing.assignedToId !== userId) {
      throw new AppError('You can only update tasks assigned to you.', 403);
    }
    // Members can only change status
    data = { status: data.status };
  }

  // If assignedToId is being changed, verify membership
  if (data.assignedToId) {
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: existing.projectId, userId: data.assignedToId } },
    });
    if (!member) {
      throw new AppError('Assigned user is not a member of this project.', 400);
    }
  }

  // Parse dueDate
  if (data.dueDate !== undefined) {
    data.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data,
    include: {
      assignedTo: { select: userSelect },
      createdBy: { select: userSelect },
      project: { select: { id: true, name: true } },
    },
  });

  return { task };
};

/**
 * Update only the status of a task.
 */
const updateStatus = async (taskId, status, userId, role) => {
  const existing = await prisma.task.findUnique({ where: { id: taskId } });

  if (!existing) {
    throw new AppError('Task not found.', 404);
  }

  // Members can only update their own assigned tasks
  if (role === 'MEMBER' && existing.assignedToId !== userId) {
    throw new AppError('You can only update status of tasks assigned to you.', 403);
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { status },
    include: {
      assignedTo: { select: userSelect },
      createdBy: { select: userSelect },
      project: { select: { id: true, name: true } },
    },
  });

  return { task };
};

/**
 * Delete a task (Admin only).
 */
const remove = async (taskId) => {
  const existing = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existing) {
    throw new AppError('Task not found.', 404);
  }

  await prisma.task.delete({ where: { id: taskId } });

  return { message: 'Task deleted successfully.' };
};

module.exports = { getByProject, create, update, updateStatus, remove };
