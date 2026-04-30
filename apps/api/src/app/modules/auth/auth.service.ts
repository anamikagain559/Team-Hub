import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import config from '../../../config';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { jwtHelpers } from '../../helper/jwtHelpers';
import prisma from '../../shared/prisma';
import { Secret } from 'jsonwebtoken';

const registerUser = async (data: any): Promise<Partial<User>> => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const result = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });
  const { password, ...userWithoutPassword } = result;
  return userWithoutPassword;
};

const loginUser = async (payload: any) => {
  const { email, password } = payload;
  const isUserExist = await prisma.user.findUnique({
    where: { email },
  });

  if (!isUserExist) {
    throw new Error('User does not exist');
  }

  const isPasswordMatched = await bcrypt.compare(password, isUserExist.password);
  if (!isPasswordMatched) {
    throw new Error('Password does not match');
  }

  const { id, role } = isUserExist;
  const accessToken = jwtHelpers.generateToken(
    { userId: id, role },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    { userId: id, role },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  let verifiedToken = null;
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret
    );
  } catch (err) {
    throw new Error('Invalid Refresh Token');
  }

  const { userId } = verifiedToken;
  const isUserExist = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!isUserExist) {
    throw new Error('User does not exist');
  }

  const newAccessToken = jwtHelpers.generateToken(
    { userId: isUserExist.id, role: isUserExist.role },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string
  );

  return {
    accessToken: newAccessToken,
  };
};

export const AuthService = {
  registerUser,
  loginUser,
  refreshToken,
};
