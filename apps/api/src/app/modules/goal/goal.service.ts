import { Goal, GoalStatus } from '@prisma/client';
import prisma from '../../shared/prisma';

const createGoal = async (userId: string, data: any): Promise<Goal> => {
  const result = await prisma.goal.create({
    data: {
      ...data,
      ownerId: userId,
    },
  });
  return result;
};

const getWorkspaceGoals = async (workspaceId: string) => {
  const result = await prisma.goal.findMany({
    where: { workspaceId },
    include: {
      milestones: true,
      owner: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });
  return result;
};

const updateGoalStatus = async (goalId: string, status: GoalStatus) => {
  const result = await prisma.goal.update({
    where: { id: goalId },
    data: { status },
  });

  // Track activity
  await prisma.activity.create({
    data: {
      goalId,
      content: `Goal status updated to ${status}`,
    },
  });

  return result;
};

const addMilestone = async (goalId: string, data: any) => {
  const result = await prisma.milestone.create({
    data: {
      ...data,
      goalId,
    },
  });
  return result;
};

export const GoalService = {
  createGoal,
  getWorkspaceGoals,
  updateGoalStatus,
  addMilestone,
};
