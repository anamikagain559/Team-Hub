import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { GoalService } from './goal.service';
import { GoalStatus } from '@prisma/client';

const createGoal = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await GoalService.createGoal(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Goal created successfully!',
    data: result,
  });
});

const getWorkspaceGoals = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  const result = await GoalService.getWorkspaceGoals(workspaceId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Goals fetched successfully!',
    data: result,
  });
});

const updateGoalStatus = catchAsync(async (req: Request, res: Response) => {
  const { goalId } = req.params;
  const { status } = req.body;
  const userId = req.user?.userId;
  const result = await GoalService.updateGoalStatus(userId as string, goalId as string, status as GoalStatus);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Goal status updated successfully!',
    data: result,
  });
});

const addMilestone = catchAsync(async (req: Request, res: Response) => {
  const { goalId } = req.params;
  const userId = req.user?.userId;
  const result = await GoalService.addMilestone(userId as string, goalId as string, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Milestone added successfully!',
    data: result,
  });
});

const updateGoal = catchAsync(async (req: Request, res: Response) => {
  const { goalId } = req.params;
  const userId = req.user?.userId;
  const result = await GoalService.updateGoal(userId as string, goalId as string, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Goal updated successfully!',
    data: result,
  });
});

const deleteGoal = catchAsync(async (req: Request, res: Response) => {
  const { goalId } = req.params;
  const userId = req.user?.userId;
  const result = await GoalService.deleteGoal(userId as string, goalId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Goal deleted successfully!',
    data: result,
  });
});

const updateMilestone = catchAsync(async (req: Request, res: Response) => {
  const { milestoneId } = req.params;
  const userId = req.user?.userId;
  const result = await GoalService.updateMilestone(userId as string, milestoneId as string, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Milestone updated successfully!',
    data: result,
  });
});

const deleteMilestone = catchAsync(async (req: Request, res: Response) => {
  const { milestoneId } = req.params;
  const userId = req.user?.userId;
  const result = await GoalService.deleteMilestone(userId as string, milestoneId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Milestone deleted successfully!',
    data: result,
  });
});

const getGoalActivity = catchAsync(async (req: Request, res: Response) => {
  const { goalId } = req.params;
  const result = await GoalService.getGoalActivity(goalId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Goal activity fetched successfully!',
    data: result,
  });
});

export const GoalController = {
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
