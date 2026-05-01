import { Announcement } from '@prisma/client';
import prisma from '../../shared/prisma';

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
  const result = await prisma.reaction.create({
    data: {
      userId,
      announcementId,
      emoji,
    },
  });
  return result;
};

const addComment = async (userId: string, announcementId: string, content: string) => {
  const result = await prisma.comment.create({
    data: {
      userId,
      announcementId,
      content,
    },
  });
  return result;
};

export const AnnouncementService = {
  createAnnouncement,
  getWorkspaceAnnouncements,
  addReaction,
  addComment,
};
