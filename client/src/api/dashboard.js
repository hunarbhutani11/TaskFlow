import api from './axios';

export const getDashboardStats = async () => {
  const res = await api.get('/dashboard/stats');
  return res.data;
};

export const getDashboardCharts = async () => {
  const res = await api.get('/dashboard/charts');
  return res.data;
};

export const getOverdueTasks = async () => {
  const res = await api.get('/dashboard/overdue');
  return res.data;
};

export const getRecentActivity = async () => {
  const res = await api.get('/dashboard/activity');
  return res.data;
};
