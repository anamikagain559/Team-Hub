import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { GoalController } from './goal.controller';
import { GoalValidation } from './goal.validation';

import workspaceAuth from '../../middlewares/workspaceAuth';
import { WorkspaceRole } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  auth(),
  workspaceAuth(WorkspaceRole.ADMIN),
  validateRequest(GoalValidation.create),
  GoalController.createGoal
);

router.get('/:workspaceId', auth(), GoalController.getWorkspaceGoals);

router.patch(
  '/:goalId',
  auth(),
  workspaceAuth(WorkspaceRole.ADMIN),
  validateRequest(GoalValidation.update),
  GoalController.updateGoal
);

router.patch(
  '/:goalId/status',
  auth(),
  GoalController.updateGoalStatus
);

router.post(
  '/:goalId/milestones',
  auth(),
  workspaceAuth(WorkspaceRole.ADMIN),
  validateRequest(GoalValidation.createMilestone),
  GoalController.addMilestone
);

router.delete(
  '/:goalId',
  auth(),
  workspaceAuth(WorkspaceRole.ADMIN),
  GoalController.deleteGoal
);

router.patch(
  '/milestones/:milestoneId',
  auth(),
  validateRequest(GoalValidation.updateMilestone),
  GoalController.updateMilestone
);

router.delete(
  '/milestones/:milestoneId',
  auth(),
  GoalController.deleteMilestone
);

router.get(
  '/:goalId/activity',
  auth(),
  GoalController.getGoalActivity
);

export const GoalRoutes = router;
