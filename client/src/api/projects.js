import api from './axios';

export const getProjects = async () => {
  const res = await api.get('/projects');
  return res.data;
};

export const getProject = async (id) => {
  const res = await api.get(`/projects/${id}`);
  return res.data;
};

export const createProject = async (data) => {
  const res = await api.post('/projects', data);
  return res.data;
};

export const updateProject = async (id, data) => {
  const res = await api.put(`/projects/${id}`, data);
  return res.data;
};

export const deleteProject = async (id) => {
  const res = await api.delete(`/projects/${id}`);
  return res.data;
};

export const addProjectMember = async (projectId, userId) => {
  const res = await api.post(`/projects/${projectId}/members`, { userId });
  return res.data;
};

export const removeProjectMember = async (projectId, userId) => {
  const res = await api.delete(`/projects/${projectId}/members/${userId}`);
  return res.data;
};
