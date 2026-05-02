import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import prisma from '../shared/prisma';

const workspaceAuth = (...allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      // Workspace ID can be in params, body, or query
      const workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;

      if (!userId) {
        throw new Error('User not found in request');
      }

      if (!workspaceId) {
        // If no workspaceId is provided, we can't check workspace-specific roles
        // We can either skip or throw error. Usually, we want to throw error if this middleware is used.
        throw new Error('Workspace ID is required for this action');
      }

      console.log(`[Auth] Checking access for User: ${userId} in Workspace: ${workspaceId}`);

      const member = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId,
          },
        },
      });

      if (!member) {
        console.warn(`[Auth] User ${userId} is NOT a member of workspace ${workspaceId}`);
        return res.status(httpStatus.FORBIDDEN).json({
          success: false,
          message: 'You are not a member of this workspace',
        });
      }

      console.log(`[Auth] User Role: ${member.role}, Allowed Roles: ${allowedRoles}`);

      if (allowedRoles.length && !allowedRoles.includes(member.role)) {
        console.warn(`[Auth] Access Denied: User role ${member.role} not in ${allowedRoles}`);
        return res.status(httpStatus.FORBIDDEN).json({
          success: false,
          message: `Forbidden: You need ${allowedRoles.join(' or ')} role in this workspace`,
        });
      }

      // Attach member info to request for later use if needed
      req.workspaceMember = member;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default workspaceAuth;
