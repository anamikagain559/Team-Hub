import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { WorkspaceService } from './workspace.service';

const createWorkspace = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await WorkspaceService.createWorkspace(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Workspace created successfully!',
    data: result,
  });
});

const getMyWorkspaces = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await WorkspaceService.getMyWorkspaces(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Workspaces fetched successfully!',
    data: result,
  });
});

const inviteMember = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  const { email, role } = req.body;
  const result = await WorkspaceService.inviteMember(workspaceId, email, role);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Member invited successfully!',
    data: result,
  });
});

export const WorkspaceController = {
  createWorkspace,
  getMyWorkspaces,
  inviteMember,
};
