import express from 'express';
import { AnalyticsController } from './analytics.controller';
import auth from '../../middlewares/auth';
import workspaceAuth from '../../middlewares/workspaceAuth';
import { WorkspaceRole } from '@prisma/client';

const router = express.Router();

router.get(
  '/stats/:workspaceId',
  auth(),
  workspaceAuth(),
  AnalyticsController.getDashboardStats
);

router.get(
  '/export/:workspaceId',
  auth(),
  workspaceAuth(WorkspaceRole.ADMIN),
  AnalyticsController.getWorkspaceExportData
);

export const AnalyticsRoutes = router;
