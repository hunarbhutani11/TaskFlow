const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const validate = require('../middleware/validate');
const { createTaskSchema, updateTaskSchema, updateStatusSchema } = require('../validators/task.validator');

// All task routes require authentication
router.use(authMiddleware);

// Tasks within a project
router.get('/projects/:projectId/tasks', taskController.getByProject);
router.post('/projects/:projectId/tasks', roleMiddleware('ADMIN'), validate(createTaskSchema), taskController.create);

// Task-level operations
router.put('/tasks/:id', roleMiddleware('ADMIN'), validate(updateTaskSchema), taskController.update);
router.patch('/tasks/:id/status', validate(updateStatusSchema), taskController.updateStatus);
router.delete('/tasks/:id', roleMiddleware('ADMIN'), taskController.remove);

module.exports = router;
