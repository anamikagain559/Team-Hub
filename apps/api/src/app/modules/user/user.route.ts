import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { UserController } from './user.controller';
import { FileUploadHelper } from '../../helper/fileUploadHelper';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.get(
  '/me',
  auth(UserRole.ADMIN, UserRole.MEMBER),
  UserController.getMe
);

router.get(
  '/',
  auth(UserRole.ADMIN, UserRole.MEMBER),
  UserController.getAllUsers
);

router.patch(
  '/update-profile',
  auth(UserRole.ADMIN, UserRole.MEMBER),
  FileUploadHelper.upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    return UserController.updateProfile(req, res, next);
  }
);

export const UserRoutes = router;
