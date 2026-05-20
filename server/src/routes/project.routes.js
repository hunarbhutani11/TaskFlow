const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const validate = require('../middleware/validate');
const { createProjectSchema, updateProjectSchema, addMemberSchema } = require('../validators/project.validator');

// All project routes require authentication
router.use(authMiddleware);

router.get('/', projectController.getAll);
router.get('/:id', projectController.getById);
router.post('/', roleMiddleware('ADMIN'), validate(createProjectSchema), projectController.create);
router.put('/:id', roleMiddleware('ADMIN'), validate(updateProjectSchema), projectController.update);
router.delete('/:id', roleMiddleware('ADMIN'), projectController.remove);

// Member management
router.post('/:id/members', roleMiddleware('ADMIN'), validate(addMemberSchema), projectController.addMember);
router.delete('/:id/members/:userId', roleMiddleware('ADMIN'), projectController.removeMember);

module.exports = router;
