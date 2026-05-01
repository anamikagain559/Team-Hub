import { Goal, GoalStatus } from '@prisma/client';
import prisma from '../../shared/prisma';

const createGoal = async (userId: string, data: any): Promise<Goal> => {
  const goalData = { ...data };
  
  if (goalData.dueDate && goalData.dueDate !== '') {
    const date = new Date(goalData.dueDate);
    if (!isNaN(date.getTime())) {
      goalData.dueDate = date;
    } else {
      delete goalData.dueDate;
    }
  } else {
    delete goalData.dueDate;
  }

  const result = await prisma.goal.create({
    data: {
      ...goalData,
      ownerId: userId,
    },
    include: {
      owner: {
        select: { id: true, name: true, avatar: true },
      },
      milestones: true,
      activity: true,
    },
  });

  // Track activity
  await prisma.activity.create({
    data: {
      goalId: result.id,
      content: `Goal "${result.title}" created`,
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
      activity: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return result;
};

const updateGoal = async (userId: string, goalId: string, data: any) => {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
  });

  if (!goal) throw new Error('Goal not found');
  if (goal.ownerId !== userId) throw new Error('You are not authorized to update this goal');

  const result = await prisma.goal.update({
    where: { id: goalId },
    data,
  });

  await prisma.activity.create({
    data: {
      goalId,
      content: `Goal details updated`,
    },
  });

  return result;
};

const deleteGoal = async (userId: string, goalId: string) => {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
  });

  if (!goal) throw new Error('Goal not found');
  if (goal.ownerId !== userId) throw new Error('You are not authorized to delete this goal');

  await prisma.milestone.deleteMany({ where: { goalId } });
  await prisma.activity.deleteMany({ where: { goalId } });
  await prisma.actionItem.deleteMany({ where: { goalId } });
  
  const result = await prisma.goal.delete({
    where: { id: goalId },
  });
  return result;
};

const updateGoalStatus = async (userId: string, goalId: string, status: GoalStatus) => {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
  });

  if (!goal) throw new Error('Goal not found');
  if (goal.ownerId !== userId) throw new Error('You are not authorized to update this goal');

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

const addMilestone = async (userId: string, goalId: string, data: any) => {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
  });

  if (!goal) throw new Error('Goal not found');
  if (goal.ownerId !== userId) throw new Error('You are not authorized to add milestones to this goal');

  const result = await prisma.milestone.create({
    data: {
      ...data,
      goalId,
    },
  });

  await prisma.activity.create({
    data: {
      goalId,
      content: `New milestone added: "${data.title}"`,
    },
  });

  return result;
};

const updateMilestone = async (userId: string, milestoneId: string, data: any) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { goal: true },
  });

  if (!milestone) throw new Error('Milestone not found');
  if (milestone.goal.ownerId !== userId) throw new Error('You are not authorized to update this milestone');

  const result = await prisma.milestone.update({
    where: { id: milestoneId },
    data,
  });

  await prisma.activity.create({
    data: {
      goalId: result.goalId,
      content: `Milestone "${result.title}" updated to ${data.progress}%`,
    },
  });

  return result;
};

const deleteMilestone = async (userId: string, milestoneId: string) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { goal: true },
  });

  if (!milestone) throw new Error('Milestone not found');
  if (milestone.goal.ownerId !== userId) throw new Error('You are not authorized to delete this milestone');

  await prisma.activity.create({
    data: {
      goalId: milestone.goalId,
      content: `Milestone "${milestone.title}" deleted`,
    },
  });

  const result = await prisma.milestone.delete({
    where: { id: milestoneId },
  });
  return result;
};

const getGoalActivity = async (goalId: string) => {
  const result = await prisma.activity.findMany({
    where: { goalId },
    orderBy: { createdAt: 'desc' },
  });
  return result;
};

export const GoalService = {
  createGoal,
  getWorkspaceGoals,
  updateGoal,
  deleteGoal,
  updateGoalStatus,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  getGoalActivity,
};
