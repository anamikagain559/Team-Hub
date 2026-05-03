import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AnnouncementController } from './announcement.controller';
import { AnnouncementValidation } from './announcement.validation';

import workspaceAuth from '../../middlewares/workspaceAuth';
import { WorkspaceRole } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  auth(),
  workspaceAuth(WorkspaceRole.ADMIN),
  validateRequest(AnnouncementValidation.create),
  AnnouncementController.createAnnouncement
);

router.get('/:workspaceId', auth(), AnnouncementController.getWorkspaceAnnouncements);

router.post(
  '/:announcementId/reactions',
  auth(),
  validateRequest(AnnouncementValidation.addReaction),
  AnnouncementController.addReaction
);

router.post(
  '/:announcementId/comments',
  auth(),
  validateRequest(AnnouncementValidation.addComment),
  AnnouncementController.addComment
);

export const AnnouncementRoutes = router;
