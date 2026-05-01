import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { GoalController } from './goal.controller';
import { GoalValidation } from './goal.validation';

const router = express.Router();

router.post(
  '/',
  auth(),
  validateRequest(GoalValidation.create),
  GoalController.createGoal
);

router.get('/:workspaceId', auth(), GoalController.getWorkspaceGoals);

router.patch(
  '/:goalId',
  auth(),
  validateRequest(GoalValidation.update),
  GoalController.updateGoal
);

router.patch(
  '/:goalId/status',
  auth(),
  validateRequest(GoalValidation.updateStatus),
  GoalController.updateGoalStatus
);

router.post(
  '/:goalId/milestones',
  auth(),
  validateRequest(GoalValidation.createMilestone),
  GoalController.addMilestone
);

router.delete(
  '/:goalId',
  auth(),
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
