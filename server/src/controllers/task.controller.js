const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const taskService = require('../services/task.service');

const getByProject = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status || null,
    priority: req.query.priority || null,
    assigneeId: req.query.assigneeId || null,
    search: req.query.search || null,
  };
  const result = await taskService.getByProject(req.params.projectId, filters, req.user.id, req.user.role);
  sendSuccess(res, result);
});

const create = asyncHandler(async (req, res) => {
  const result = await taskService.create(req.params.projectId, req.validatedBody, req.user.id);
  sendSuccess(res, result, 201);
});

const update = asyncHandler(async (req, res) => {
  const result = await taskService.update(req.params.id, req.validatedBody, req.user.id, req.user.role);
  sendSuccess(res, result);
});

const updateStatus = asyncHandler(async (req, res) => {
  const result = await taskService.updateStatus(req.params.id, req.validatedBody.status, req.user.id, req.user.role);
  sendSuccess(res, result);
});

const remove = asyncHandler(async (req, res) => {
  const result = await taskService.remove(req.params.id);
  sendSuccess(res, result);
});

module.exports = { getByProject, create, update, updateStatus, remove };
