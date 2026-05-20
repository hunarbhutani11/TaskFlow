const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const projectService = require('../services/project.service');

const getAll = asyncHandler(async (req, res) => {
  const result = await projectService.getAll(req.user.id, req.user.role);
  sendSuccess(res, result);
});

const getById = asyncHandler(async (req, res) => {
  const result = await projectService.getById(req.params.id, req.user.id, req.user.role);
  sendSuccess(res, result);
});

const create = asyncHandler(async (req, res) => {
  const result = await projectService.create({
    ...req.validatedBody,
    createdById: req.user.id,
  });
  sendSuccess(res, result, 201);
});

const update = asyncHandler(async (req, res) => {
  const result = await projectService.update(req.params.id, req.validatedBody);
  sendSuccess(res, result);
});

const remove = asyncHandler(async (req, res) => {
  const result = await projectService.remove(req.params.id);
  sendSuccess(res, result);
});

const addMember = asyncHandler(async (req, res) => {
  const result = await projectService.addMember(req.params.id, req.validatedBody.userId);
  sendSuccess(res, result, 201);
});

const removeMember = asyncHandler(async (req, res) => {
  const result = await projectService.removeMember(req.params.id, req.params.userId);
  sendSuccess(res, result);
});

module.exports = { getAll, getById, create, update, remove, addMember, removeMember };
