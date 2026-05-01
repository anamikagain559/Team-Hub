import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { AnnouncementService } from './announcement.service';

const createAnnouncement = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await AnnouncementService.createAnnouncement(userId as string, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Announcement created successfully!',
    data: result,
  });
});

const getWorkspaceAnnouncements = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  const result = await AnnouncementService.getWorkspaceAnnouncements(workspaceId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Announcements fetched successfully!',
    data: result,
  });
});

const addReaction = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { announcementId } = req.params;
  const { emoji } = req.body;
  const result = await AnnouncementService.addReaction(userId as string, announcementId as string, emoji as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reaction added successfully!',
    data: result,
  });
});

const addComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { announcementId } = req.params;
  const { content } = req.body;
  const result = await AnnouncementService.addComment(userId as string, announcementId as string, content as string);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Comment added successfully!',
    data: result,
  });
});

export const AnnouncementController = {
  createAnnouncement,
  getWorkspaceAnnouncements,
  addReaction,
  addComment,
};
