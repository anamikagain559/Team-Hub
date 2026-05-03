import { User } from '@prisma/client';
import prisma from '../../shared/prisma';
import { FileUploadHelper } from '../../helper/fileUploadHelper';
import { IUploadFile } from '../../types/file';

/**
 * Fetches current user profile from database
 */
const getMe = async (userId: string): Promise<Partial<User> | null> => {
  const result = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return result;
};

/**
 * Updates user profile including name and avatar
 * Handles Cloudinary upload if a file is provided
 */
const updateProfile = async (
  userId: string,
  payload: Partial<User>,
  file?: IUploadFile
): Promise<Partial<User>> => {
  // If file exists, upload to Cloudinary and update payload
  if (file) {
    const uploadResponse = await FileUploadHelper.uploadToCloudinary(file);
    if (uploadResponse) {
      payload.avatar = uploadResponse.secure_url;
    }
  }

  // Update user in database
  const result = await prisma.user.update({
    where: { id: userId },
    data: payload,
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
    },
  });

  return result;
};

/**
 * Retrieves all users (typically for Admin use)
 */
const getAllUsers = async (): Promise<Partial<User>[]> => {
  const result = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return result;
};

export const UserService = {
  getMe,
  updateProfile,
  getAllUsers,
};
