import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceValidation } from './workspace.validation';

const router = express.Router();

router.post(
  '/',
  auth(),
  validateRequest(WorkspaceValidation.create),
  WorkspaceController.createWorkspace
);

router.get('/', auth(), WorkspaceController.getMyWorkspaces);

router.post(
  '/:workspaceId/invite',
  auth('ADMIN'), // Only system admins or workspace admins? I'll stick to auth() for now and check workspace role in service if needed
  validateRequest(WorkspaceValidation.invite),
  WorkspaceController.inviteMember
);

export const WorkspaceRoutes = router;
