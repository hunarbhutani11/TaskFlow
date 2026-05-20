import api from './axios';

export const getTasks = async (projectId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.assigneeId) params.append('assigneeId', filters.assigneeId);
  if (filters.search) params.append('search', filters.search);

  const res = await api.get(`/projects/${projectId}/tasks?${params.toString()}`);
  return res.data;
};

export const createTask = async (projectId, data) => {
  const res = await api.post(`/projects/${projectId}/tasks`, data);
  return res.data;
};

export const updateTask = async (taskId, data) => {
  const res = await api.put(`/tasks/${taskId}`, data);
  return res.data;
};

export const updateTaskStatus = async (taskId, status) => {
  const res = await api.patch(`/tasks/${taskId}/status`, { status });
  return res.data;
};

export const deleteTask = async (taskId) => {
  const res = await api.delete(`/tasks/${taskId}`);
  return res.data;
};
