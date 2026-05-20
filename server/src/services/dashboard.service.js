const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
};

/**
 * Get dashboard stats — total tasks, in progress, completed, overdue.
 * Admin sees all data; Member sees only their own assigned tasks.
 */
const getStats = async (userId, role) => {
  const where = role === 'ADMIN' ? {} : { assignedToId: userId };
  const now = new Date();

  const [totalTasks, inProgress, completed, overdue] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.count({ where: { ...where, status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { ...where, status: 'DONE' } }),
    prisma.task.count({
      where: {
        ...where,
        status: { not: 'DONE' },
        dueDate: { lt: now },
      },
    }),
  ]);

  return { totalTasks, inProgress, completed, overdue };
};

/**
 * Get chart data — tasks grouped by project and by status.
 */
const getCharts = async (userId, role) => {
  const where = role === 'ADMIN' ? {} : { assignedToId: userId };

  // Tasks by project
  const projects = await prisma.project.findMany({
    where: role === 'ADMIN' ? {} : { members: { some: { userId } } },
    include: {
      tasks: {
        where: role === 'ADMIN' ? {} : { assignedToId: userId },
        select: { id: true, status: true },
      },
    },
  });

  const tasksByProject = projects.map((p) => ({
    name: p.name,
    total: p.tasks.length,
    done: p.tasks.filter((t) => t.status === 'DONE').length,
    inProgress: p.tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    todo: p.tasks.filter((t) => t.status === 'TODO').length,
  }));

  // Tasks by status
  const [todo, inProgress, done] = await Promise.all([
    prisma.task.count({ where: { ...where, status: 'TODO' } }),
    prisma.task.count({ where: { ...where, status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { ...where, status: 'DONE' } }),
  ]);

  const tasksByStatus = [
    { name: 'To Do', value: todo, color: '#64748b' },
    { name: 'In Progress', value: inProgress, color: '#6366f1' },
    { name: 'Done', value: done, color: '#10b981' },
  ];

  return { tasksByProject, tasksByStatus };
};

/**
 * Get overdue tasks.
 */
const getOverdue = async (userId, role) => {
  const where = {
    status: { not: 'DONE' },
    dueDate: { lt: new Date() },
  };

  if (role !== 'ADMIN') {
    where.assignedToId = userId;
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignedTo: { select: userSelect },
      project: { select: { id: true, name: true } },
    },
    orderBy: { dueDate: 'asc' },
    take: 10,
  });

  return { tasks };
};

/**
 * Get recent activity — last 10 tasks updated.
 */
const getActivity = async (userId, role) => {
  const where = role === 'ADMIN' ? {} : { assignedToId: userId };

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignedTo: { select: userSelect },
      createdBy: { select: userSelect },
      project: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });

  const activities = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    project: task.project,
    assignedTo: task.assignedTo,
    updatedAt: task.updatedAt,
  }));

  return { activities };
};

module.exports = { getStats, getCharts, getOverdue, getActivity };
