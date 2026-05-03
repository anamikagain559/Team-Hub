import { Announcement } from '@prisma/client';
import prisma from '../../shared/prisma';
import { EmailHelper } from '../../helper/emailHelper';
import { SocketHelper } from '../../helper/socketHelper';

const createAnnouncement = async (userId: string, data: any): Promise<Announcement> => {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId: data.workspaceId,
      },
    },
  });

  if (!member) {
    throw new Error('You must be a member of this workspace to publish announcements');
  }

  const result = await prisma.announcement.create({
    data: {
      ...data,
      authorId: userId,
    },
    include: {
      author: { select: { name: true, avatar: true } },
    }
  });

  // Emit Socket Event
  SocketHelper.emitToWorkspace(data.workspaceId, 'new_announcement', result);

  // Handle Mentions in Announcement Body
  if (result) {
    EmailHelper.handleMentions(
      result.content,
      result.workspaceId,
      result.author?.name || 'Someone',
      result.title || 'a new announcement'
    );
  }

  return result;
};

const getWorkspaceAnnouncements = async (workspaceId: string) => {
  const result = await prisma.announcement.findMany({
    where: { workspaceId },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      comments: {
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'asc' }
      },
      reactions: {
        include: {
          user: { select: { id: true, name: true } },
        }
      },
    },
    orderBy: [
      { isPinned: 'desc' },
      { createdAt: 'desc' },
    ],
  });
  return result;
};

const addReaction = async (userId: string, announcementId: string, emoji: string) => {
  // Check if reaction already exists
  const existingReaction = await prisma.reaction.findFirst({
    where: {
      userId,
      announcementId,
      emoji,
    },
    include: {
      announcement: { select: { workspaceId: true } }
    }
  });

  if (existingReaction) {
    // Toggle: Remove reaction
    await prisma.reaction.delete({
      where: { id: existingReaction.id },
    });

    SocketHelper.emitToWorkspace(existingReaction.announcement.workspaceId, 'remove_reaction', {
      announcementId,
      reactionId: existingReaction.id
    });

    return { id: existingReaction.id, removed: true };
  }

  // Create new reaction
  const result = await prisma.reaction.create({
    data: {
      userId,
      announcementId,
      emoji,
    },
    include: {
      user: { select: { id: true, name: true } },
      announcement: { select: { workspaceId: true } }
    }
  });

  SocketHelper.emitToWorkspace(result.announcement.workspaceId, 'new_reaction', {
    announcementId,
    reaction: result
  });

  return result;
};

const addComment = async (userId: string, announcementId: string, content: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const announcement = await prisma.announcement.findUnique({ where: { id: announcementId } });

  const result = await prisma.comment.create({
    data: {
      userId,
      announcementId,
      content,
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } }
    }
  });

  if (announcement) {
    SocketHelper.emitToWorkspace(announcement.workspaceId, 'new_comment', {
      announcementId,
      comment: result
    });

    // Notify the announcement author (if not the one commenting)
    if (announcement.authorId !== userId) {
      const { NotificationService } = require('../modules/notification/notification.service');
      await NotificationService.createNotification({
        userId: announcement.authorId,
        type: 'ANNOUNCEMENT',
        content: `${user?.name || 'Someone'} commented on your announcement: "${announcement.title}"`,
      }).catch((e: any) => console.error('[NotificationError]:', e));
    }
  }

  // Handle Mentions in Comment
  if (result && announcement) {
    EmailHelper.handleMentions(
      content,
      announcement.workspaceId,
      user?.name || 'Someone',
      announcement.title
    );
  }

  return result;
};

export const AnnouncementService = {
  createAnnouncement,
  getWorkspaceAnnouncements,
  addReaction,
  addComment,
};
