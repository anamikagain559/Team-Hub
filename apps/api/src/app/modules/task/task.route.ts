import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { TaskController } from './task.controller';
import { TaskValidation } from './task.validation';

const router = express.Router();

router.post(
  '/',
  auth(),
  validateRequest(TaskValidation.create),
  TaskController.createTask
);

router.get('/:workspaceId', auth(), TaskController.getWorkspaceTasks);

router.patch(
  '/:taskId/status',
  auth(),
  validateRequest(TaskValidation.updateStatus),
  TaskController.updateTaskStatus
);

export const TaskRoutes = router;
