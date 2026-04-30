import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';

const router = express.Router();

router.post(
  '/register',
  validateRequest(AuthValidation.register),
  AuthController.registerUser
);

router.post(
  '/login',
  validateRequest(AuthValidation.login),
  AuthController.loginUser
);

router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshToken),
  AuthController.refreshToken
);

router.post('/logout', AuthController.logout);

export const AuthRoutes = router;
