import { ActionItem, Goal, GoalStatus } from '@prisma/client';
import prisma from '../../shared/prisma';
import { startOfWeek, endOfWeek, subWeeks, format } from 'date-fns';

const getDashboardStats = async (workspaceId: string) => {
  const now = new Date();
  const weekStart = startOfWeek(now);

  const [totalGoals, itemsCompletedThisWeek, overdueCount] = await Promise.all([
    prisma.goal.count({
      where: { workspaceId },
    }),
    prisma.actionItem.count({
      where: {
        workspaceId,
        status: 'COMPLETED',
        updatedAt: { gte: weekStart },
      },
    }),
    prisma.actionItem.count({
      where: {
        workspaceId,
        status: { not: 'COMPLETED' },
        dueDate: { lt: now },
      },
    }),
  ]);

  // For the chart: Goal completion trends (last 4 weeks)
  const chartData = [];
  for (let i = 3; i >= 0; i--) {
    const start = startOfWeek(subWeeks(now, i));
    const end = endOfWeek(subWeeks(now, i));
    const count = await prisma.goal.count({
      where: {
        workspaceId,
        status: GoalStatus.COMPLETED,
        updatedAt: { gte: start, lte: end },
      },
    });
    chartData.push({
      week: format(start, 'MMM dd'),
      completed: count,
    });
  }

  return {
    totalGoals,
    itemsCompletedThisWeek,
    overdueCount,
    chartData,
  };
};

const getWorkspaceExportData = async (workspaceId: string) => {
  const [goals, actionItems, members] = await Promise.all([
    prisma.goal.findMany({
      where: { workspaceId },
      include: { owner: true },
    }),
    prisma.actionItem.findMany({
      where: { workspaceId },
      include: { assignee: true, goal: true },
    }),
    prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: true },
    }),
  ]);

  return { goals, actionItems, members };
};

export const AnalyticsService = {
  getDashboardStats,
  getWorkspaceExportData,
};
