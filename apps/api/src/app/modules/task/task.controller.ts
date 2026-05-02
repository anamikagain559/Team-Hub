import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { TaskService } from './task.service';

const createTask = catchAsync(async (req: Request, res: Response) => {
  const assignerId = req.user?.userId;
  const result = await TaskService.createTask(req.body, assignerId as string);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Task created successfully!',
    data: result,
  });
});

const getWorkspaceTasks = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  const result = await TaskService.getWorkspaceTasks(workspaceId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Tasks fetched successfully!',
    data: result,
  });
});

const updateTask = catchAsync(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const result = await TaskService.updateTask(taskId as string, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Task updated successfully!',
    data: result,
  });
});

const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const result = await TaskService.deleteTask(taskId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Task deleted successfully!',
    data: result,
  });
});

const updateTaskStatus = catchAsync(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { status } = req.body;
  const result = await TaskService.updateTaskStatus(taskId as string, status as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Task status updated successfully!',
    data: result,
  });
});

export const TaskController = {
  createTask,
  getWorkspaceTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
};
