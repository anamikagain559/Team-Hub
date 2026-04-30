import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AnnouncementController } from './announcement.controller';
import { AnnouncementValidation } from './announcement.validation';

const router = express.Router();

router.post(
  '/',
  auth('ADMIN'), // Only workspace/system admins can post
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
