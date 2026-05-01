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

router.get('/:workspaceId/members', auth(), WorkspaceController.getWorkspaceMembers);

router.post(
  '/:workspaceId/invite',
  auth(),
  validateRequest(WorkspaceValidation.invite),
  WorkspaceController.inviteMember
);

router.patch(
  '/members/:memberId',
  auth(),
  WorkspaceController.updateMemberRole
);

router.delete(
  '/members/:memberId',
  auth(),
  WorkspaceController.removeMember
);

export const WorkspaceRoutes = router;
