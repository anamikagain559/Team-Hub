import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { AnalyticsService } from './analytics.service';

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  const result = await AnalyticsService.getDashboardStats(workspaceId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard stats fetched successfully',
    data: result,
  });
});

const getWorkspaceExportData = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  const result = await AnalyticsService.getWorkspaceExportData(workspaceId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Workspace data for export fetched successfully',
    data: result,
  });
});

export const AnalyticsController = {
  getDashboardStats,
  getWorkspaceExportData,
};
