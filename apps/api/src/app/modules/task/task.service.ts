import { ActionItem } from '@prisma/client';
import prisma from '../../shared/prisma';

const createTask = async (data: any): Promise<ActionItem> => {
  const result = await prisma.actionItem.create({
    data,
  });
  return result;
};

const getWorkspaceTasks = async (workspaceId: string) => {
  // Action items don't have workspaceId directly in schema, but they are linked to goals or users
  // I'll update the schema or query via goals
  const result = await prisma.actionItem.findMany({
    where: {
      OR: [
        { goal: { workspaceId } },
        { assignee: { workspaces: { some: { workspaceId } } } }
      ]
    },
    include: {
      assignee: { select: { name: true, avatar: true } },
      goal: { select: { title: true } },
    },
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

export const TaskService = {
  createTask,
  getWorkspaceTasks,
  updateTaskStatus,
};
