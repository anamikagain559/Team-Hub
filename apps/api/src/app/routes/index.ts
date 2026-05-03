import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { WorkspaceRoutes } from '../modules/workspace/workspace.route';
import { GoalRoutes } from '../modules/goal/goal.route';
import { AnnouncementRoutes } from '../modules/announcement/announcement.route';
import { TaskRoutes } from '../modules/task/task.route';
import { UserRoutes } from '../modules/user/user.route';
import { NotificationRoutes } from '../modules/notification/notification.route';
import { AnalyticsRoutes } from '../modules/analytics/analytics.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/workspaces',
    route: WorkspaceRoutes,
  },
  {
    path: '/goals',
    route: GoalRoutes,
  },
  {
    path: '/announcements',
    route: AnnouncementRoutes,
  },
  {
    path: '/tasks',
    route: TaskRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/notifications',
    route: NotificationRoutes,
  },
  {
    path: '/analytics',
    route: AnalyticsRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
