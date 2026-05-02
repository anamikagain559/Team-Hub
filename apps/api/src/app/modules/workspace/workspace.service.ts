import { Workspace, WorkspaceRole } from '@prisma/client';
import prisma from '../../shared/prisma';
import { EmailHelper } from '../../helper/emailHelper';

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

    return {
      ...workspace,
      currentUserRole: WorkspaceRole.ADMIN,
    };
  });

  return result;
};

const getMyWorkspaces = async (userId: string) => {
  const result = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
      },
    },
  });
  return result.map((m) => ({
    ...m.workspace,
    currentUserRole: m.role,
  }));
};

const inviteMember = async (workspaceId: string, email: string, role: WorkspaceRole = WorkspaceRole.MEMBER, inviterId?: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found with this email');
  }

  // Fetch workspace and inviter details for email
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId }
  });

  const inviter = inviterId ? await prisma.user.findUnique({
    where: { id: inviterId }
  }) : null;

  const isAlreadyMember = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId,
      },
    },
  });

  if (isAlreadyMember) {
    throw new Error('User is already a member of this workspace');
  }

  const result = await prisma.workspaceMember.create({
    data: {
      userId: user.id,
      workspaceId,
      role,
    },
  });

  // Send Email Notification
  if (workspace) {
    try {
      const emailTemplate = EmailHelper.getInvitationTemplate(
        workspace.name,
        inviter?.name || 'Someone'
      );
      await EmailHelper.sendEmail(
        email,
        `You've been invited to ${workspace.name} on TeamHub`,
        emailTemplate
      );
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      // We don't throw here to ensure the invitation still works even if email fails
    }
  }

  return result;
};

const getWorkspaceMembers = async (workspaceId: string) => {
  const result = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });
  return result;
};

export const WorkspaceService = {
  createWorkspace,
  getMyWorkspaces,
  inviteMember,
  getWorkspaceMembers,
  updateMemberRole: async (memberId: string, role: WorkspaceRole) => {
    return await prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role },
    });
  },
  removeMember: async (memberId: string) => {
    return await prisma.workspaceMember.delete({
      where: { id: memberId },
    });
  },
};
