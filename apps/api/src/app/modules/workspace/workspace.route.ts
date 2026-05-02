import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceValidation } from './workspace.validation';

import workspaceAuth from '../../middlewares/workspaceAuth';

const router = express.Router();

router.post(
  '/',
  auth(),
  validateRequest(WorkspaceValidation.create),
  WorkspaceController.createWorkspace
);

router.get('/', auth(), WorkspaceController.getMyWorkspaces);

router.get('/:workspaceId/members', auth(), WorkspaceController.getWorkspaceMembers);

router.post(
  '/:workspaceId/invite',
  auth(),
  workspaceAuth('ADMIN'),
  validateRequest(WorkspaceValidation.invite),
  WorkspaceController.inviteMember
);

router.patch(
  '/:workspaceId',
  auth(),
  workspaceAuth('ADMIN'),
  WorkspaceController.updateWorkspace
);

router.delete(
  '/:workspaceId',
  auth(),
  workspaceAuth('ADMIN'),
  WorkspaceController.deleteWorkspace
);

router.patch(
  '/:workspaceId/members/:memberId',
  auth(),
  workspaceAuth('ADMIN'),
  WorkspaceController.updateMemberRole
);

router.delete(
  '/:workspaceId/members/:memberId',
  auth(),
  workspaceAuth('ADMIN'),
  WorkspaceController.removeMember
);

export const WorkspaceRoutes = router;
