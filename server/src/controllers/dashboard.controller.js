const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const dashboardService = require('../services/dashboard.service');

const getStats = asyncHandler(async (req, res) => {
  const result = await dashboardService.getStats(req.user.id, req.user.role);
  sendSuccess(res, result);
});

const getCharts = asyncHandler(async (req, res) => {
  const result = await dashboardService.getCharts(req.user.id, req.user.role);
  sendSuccess(res, result);
});

const getOverdue = asyncHandler(async (req, res) => {
  const result = await dashboardService.getOverdue(req.user.id, req.user.role);
  sendSuccess(res, result);
});

const getActivity = asyncHandler(async (req, res) => {
  const result = await dashboardService.getActivity(req.user.id, req.user.role);
  sendSuccess(res, result);
});

module.exports = { getStats, getCharts, getOverdue, getActivity };
