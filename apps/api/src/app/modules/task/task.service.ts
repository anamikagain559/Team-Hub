import { ActionItem } from '@prisma/client';
import prisma from '../../shared/prisma';

const createTask = async (data: any): Promise<ActionItem> => {
  const result = await prisma.actionItem.create({
    data,
    include: {
      assignee: { select: { name: true, avatar: true } },
      goal: { select: { title: true } },
    },
  });
  return result;
};

const getWorkspaceTasks = async (workspaceId: string) => {
  const result = await prisma.actionItem.findMany({
    where: { workspaceId },
    include: {
      assignee: { select: { name: true, avatar: true } },
      goal: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return result;
};

const updateTaskStatus = async (taskId: string, status: string) => {
  const result = await prisma.actionItem.update({
    where: { id: taskId },
    data: { status },
  });
  return result;
};

const deleteTask = async (taskId: string) => {
  const result = await prisma.actionItem.delete({
    where: { id: taskId },
  });
  return result;
};

export const TaskService = {
  createTask,
  getWorkspaceTasks,
  updateTaskStatus,
  deleteTask,
};
