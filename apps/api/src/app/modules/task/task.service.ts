import { ActionItem } from '@prisma/client';
import prisma from '../../shared/prisma';
import { EmailHelper } from '../../helper/emailHelper';
import { SocketHelper } from '../../helper/socketHelper';

const createTask = async (data: any, assignerId?: string): Promise<ActionItem> => {
  const assigner = assignerId ? await prisma.user.findUnique({ where: { id: assignerId } }) : null;

  const result = await prisma.actionItem.create({
    data,
    include: {
      assignee: { select: { name: true, avatar: true, email: true } },
      goal: { select: { title: true } },
    },
  });

  // Send Email Notification to Assignee
  if (result.assignee?.email) {
    try {
      const emailTemplate = EmailHelper.getTaskAssignmentTemplate(
        assigner?.name || 'A team member',
        result.title,
        result.priority,
        result.dueDate?.toISOString()
      );
      await EmailHelper.sendEmail(
        result.assignee.email,
        `New Task Assigned: ${result.title}`,
        emailTemplate
      );
    } catch (error) {
      console.error('Failed to send task assignment email:', error);
    }
  }

  // Emit Socket Event
  SocketHelper.emitToWorkspace(result.workspaceId, 'new_task', result);

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
  // Emit Socket Event
  SocketHelper.emitToWorkspace(result.workspaceId, 'task_status_updated', {
    taskId,
    status,
  });

  return result;
};

const updateTask = async (taskId: string, data: any) => {
  const result = await prisma.actionItem.update({
    where: { id: taskId },
    data,
    include: {
      assignee: { select: { name: true, avatar: true } },
      goal: { select: { title: true } },
    },
  });

  // Emit Socket Event
  SocketHelper.emitToWorkspace(result.workspaceId, 'task_updated', result);

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
  updateTask,
  deleteTask,
};
