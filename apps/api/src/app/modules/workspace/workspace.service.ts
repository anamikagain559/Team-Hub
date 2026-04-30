import { Workspace, WorkspaceRole } from '@prisma/client';
import prisma from '../../shared/prisma';

const createWorkspace = async (userId: string, data: any): Promise<Workspace> => {
  const result = await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data,
    });

    await tx.workspaceMember.create({
      data: {
        userId,
        workspaceId: workspace.id,
        role: WorkspaceRole.ADMIN,
      },
    });

    return workspace;
  });

  return result;
};

const getMyWorkspaces = async (userId: string) => {
  const result = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: true,
    },
  });
  return result.map((m) => m.workspace);
};

const inviteMember = async (workspaceId: string, email: string, role: WorkspaceRole = WorkspaceRole.MEMBER) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found with this email');
  }

  const result = await prisma.workspaceMember.create({
    data: {
      userId: user.id,
      workspaceId,
      role,
    },
  });

  return result;
};

export const WorkspaceService = {
  createWorkspace,
  getMyWorkspaces,
  inviteMember,
};
