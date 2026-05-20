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
 * Get all projects. Admin sees all; Member sees only projects they belong to.
 */
const getAll = async (userId, role) => {
  const where = role === 'ADMIN'
    ? {}
    : { members: { some: { userId } } };

  const projects = await prisma.project.findMany({
    where,
    include: {
      createdBy: { select: userSelect },
      members: {
        include: { user: { select: userSelect } },
      },
      tasks: {
        select: { id: true, status: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Compute task stats for each project
  const projectsWithStats = projects.map((project) => {
    const totalTasks = project.tasks.length;
    const doneTasks = project.tasks.filter((t) => t.status === 'DONE').length;
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      createdBy: project.createdBy,
      createdAt: project.createdAt,
      members: project.members.map((m) => m.user),
      totalTasks,
      doneTasks,
    };
  });

  return { projects: projectsWithStats };
};

/**
 * Get a single project by ID with members and tasks.
 */
const getById = async (projectId, userId, role) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      createdBy: { select: userSelect },
      members: {
        include: { user: { select: userSelect } },
      },
      tasks: {
        include: {
          assignedTo: { select: userSelect },
          createdBy: { select: userSelect },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  // Check if member has access
  if (role !== 'ADMIN') {
    const isMember = project.members.some((m) => m.user.id === userId);
    if (!isMember) {
      throw new AppError('You do not have access to this project.', 403);
    }
  }

  return {
    project: {
      ...project,
      members: project.members.map((m) => ({ ...m.user, joinedAt: m.joinedAt })),
    },
  };
};

/**
 * Create a new project (Admin only).
 */
const create = async ({ name, description, createdById }) => {
  const project = await prisma.project.create({
    data: {
      name,
      description,
      createdById,
      members: {
        create: { userId: createdById },
      },
    },
    include: {
      createdBy: { select: userSelect },
      members: {
        include: { user: { select: userSelect } },
      },
    },
  });

  return {
    project: {
      ...project,
      members: project.members.map((m) => m.user),
      totalTasks: 0,
      doneTasks: 0,
    },
  };
};

/**
 * Update a project (Admin only).
 */
const update = async (projectId, data) => {
  const existing = await prisma.project.findUnique({ where: { id: projectId } });
  if (!existing) {
    throw new AppError('Project not found.', 404);
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data,
    include: {
      createdBy: { select: userSelect },
      members: {
        include: { user: { select: userSelect } },
      },
    },
  });

  return {
    project: {
      ...project,
      members: project.members.map((m) => m.user),
    },
  };
};

/**
 * Delete a project (Admin only).
 */
const remove = async (projectId) => {
  const existing = await prisma.project.findUnique({ where: { id: projectId } });
  if (!existing) {
    throw new AppError('Project not found.', 404);
  }

  await prisma.project.delete({ where: { id: projectId } });

  return { message: 'Project deleted successfully.' };
};

/**
 * Add a member to a project (Admin only).
 */
const addMember = async (projectId, userId) => {
  // Check project exists
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  // Check user exists
  const user = await prisma.user.findUnique({ where: { id: userId }, select: userSelect });
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  // Check if already a member
  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (existing) {
    throw new AppError('User is already a member of this project.', 409);
  }

  await prisma.projectMember.create({
    data: { projectId, userId },
  });

  return { member: user };
};

/**
 * Remove a member from a project (Admin only).
 */
const removeMember = async (projectId, userId) => {
  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!existing) {
    throw new AppError('User is not a member of this project.', 404);
  }

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId } },
  });

  return { message: 'Member removed successfully.' };
};

module.exports = { getAll, getById, create, update, remove, addMember, removeMember };
