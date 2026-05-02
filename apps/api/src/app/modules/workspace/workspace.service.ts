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
  updateWorkspace: async (id: string, userId: string, data: any) => {
    const workspace = await prisma.workspace.update({
      where: { id },
      data,
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
    });

    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: id,
        },
      },
    });

    return {
      ...workspace,
      currentUserRole: member?.role,
    };
  },
  deleteWorkspace: async (id: string) => {
    console.log(`[Service] START: Manual step-by-step purge for Workspace ID: ${id}`);
    
    // Step 1: Purge Goal children
    try {
      console.log("[Service] Step 1: Purging Activities and Milestones...");
      await prisma.activity.deleteMany({ where: { goal: { workspaceId: id } } });
      await prisma.milestone.deleteMany({ where: { goal: { workspaceId: id } } });
    } catch (e) { console.warn("[Service] Step 1 Failed (skipping):", e); }

    // Step 2: Purge Announcement children
    try {
      console.log("[Service] Step 2: Purging Comments and Reactions...");
      await prisma.comment.deleteMany({ where: { announcement: { workspaceId: id } } });
      await prisma.reaction.deleteMany({ where: { announcement: { workspaceId: id } } });
    } catch (e) { console.warn("[Service] Step 2 Failed (skipping):", e); }

    // Step 3: Purge ActionItems
    try {
      console.log("[Service] Step 3: Purging ActionItems...");
      await prisma.actionItem.deleteMany({ where: { workspaceId: id } });
    } catch (e) { console.warn("[Service] Step 3 Failed (skipping):", e); }

    // Step 4: Purge Announcements
    try {
      console.log("[Service] Step 4: Purging Announcements...");
      await prisma.announcement.deleteMany({ where: { workspaceId: id } });
    } catch (e) { console.warn("[Service] Step 4 Failed (skipping):", e); }

    // Step 5: Purge Goals
    try {
      console.log("[Service] Step 5: Purging Goals...");
      await prisma.goal.deleteMany({ where: { workspaceId: id } });
    } catch (e) { console.warn("[Service] Step 5 Failed (skipping):", e); }

    // Step 6: Purge Workspace Members
    try {
      console.log("[Service] Step 6: Purging Workspace Members...");
      await prisma.workspaceMember.deleteMany({ where: { workspaceId: id } });
    } catch (e) { console.warn("[Service] Step 6 Failed (skipping):", e); }

    // Step 7: Final delete
    try {
      console.log("[Service] Step 7: Finalizing Workspace deletion...");
      const result = await prisma.workspace.delete({ where: { id } });
      console.log("[Service] SUCCESS: Workspace purged.");
      return result;
    } catch (error: any) {
      console.error("[Service] CRITICAL: Final workspace deletion failed!", error);
      throw error;
    }
  },
};
