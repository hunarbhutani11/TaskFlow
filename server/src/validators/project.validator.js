const { z } = require('zod');

const createProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').max(100),
  description: z.string().max(500).optional().default(''),
});

const updateProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').max(100).optional(),
  description: z.string().max(500).optional(),
});

const addMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

module.exports = { createProjectSchema, updateProjectSchema, addMemberSchema };
