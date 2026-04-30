import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import { jwtHelpers } from '../helper/jwtHelpers';

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        throw new Error('You are not authorized');
      }

      let verifiedUser = null;
      verifiedUser = jwtHelpers.verifyToken(token, config.jwt.access_secret as Secret);

      req.user = verifiedUser; // userId, role

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new Error('Forbidden');
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
