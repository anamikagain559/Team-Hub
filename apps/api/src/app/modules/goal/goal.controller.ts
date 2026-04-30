import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { GoalService } from './goal.service';

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
  const result = await GoalService.getWorkspaceGoals(workspaceId);
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
  const result = await GoalService.updateGoalStatus(goalId, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Goal status updated successfully!',
    data: result,
  });
});

const addMilestone = catchAsync(async (req: Request, res: Response) => {
  const { goalId } = req.params;
  const result = await GoalService.addMilestone(goalId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Milestone added successfully!',
    data: result,
  });
});

export const GoalController = {
  createGoal,
  getWorkspaceGoals,
  updateGoalStatus,
  addMilestone,
};
