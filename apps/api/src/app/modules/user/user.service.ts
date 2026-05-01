import { User } from '@prisma/client';
import prisma from '../../shared/prisma';
import { FileUploadHelper } from '../../helper/fileUploadHelper';
import { IUploadFile } from '../../types/file';

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

const updateProfile = async (
  userId: string,
  payload: Partial<User>,
  file?: IUploadFile
): Promise<Partial<User>> => {
  if (file) {
    const uploadResponse = await FileUploadHelper.uploadToCloudinary(file);
    if (uploadResponse) {
      payload.avatar = uploadResponse.secure_url;
    }
  }

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
