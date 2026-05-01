import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { UserService } from './user.service';
import { IUploadFile } from '../../types/file';

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await UserService.getMe(user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile fetched successfully!',
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const file = req.file as IUploadFile;
  const data = req.body;

  const result = await UserService.updateProfile(user.userId, data, file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully!',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users fetched successfully!',
    data: result,
  });
});

export const UserController = {
  getMe,
  updateProfile,
  getAllUsers,
};
