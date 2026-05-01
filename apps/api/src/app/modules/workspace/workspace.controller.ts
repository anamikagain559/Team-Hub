import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { WorkspaceService } from './workspace.service';

const createWorkspace = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await WorkspaceService.createWorkspace(userId as string, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Workspace created successfully!',
    data: result,
  });
});

const getMyWorkspaces = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await WorkspaceService.getMyWorkspaces(userId as string);
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
  const result = await WorkspaceService.inviteMember(workspaceId as string, email, role);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Member invited successfully!',
    data: result,
  });
});

const getWorkspaceMembers = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  const result = await WorkspaceService.getWorkspaceMembers(workspaceId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Workspace members fetched successfully!',
    data: result,
  });
});

export const WorkspaceController = {
  createWorkspace,
  getMyWorkspaces,
  inviteMember,
  getWorkspaceMembers,
  updateMemberRole: catchAsync(async (req: Request, res: Response) => {
    const { memberId } = req.params;
    const { role } = req.body;
    const result = await WorkspaceService.updateMemberRole(memberId, role);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Member role updated successfully!',
      data: result,
    });
  }),
  removeMember: catchAsync(async (req: Request, res: Response) => {
    const { memberId } = req.params;
    const result = await WorkspaceService.removeMember(memberId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Member removed successfully!',
      data: result,
    });
  }),
};
