const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const userService = require('../services/user.service');

const getAll = asyncHandler(async (req, res) => {
  const result = await userService.getAll();
  sendSuccess(res, result);
});

module.exports = { getAll };
