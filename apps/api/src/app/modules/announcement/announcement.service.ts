import { Announcement } from '@prisma/client';
import prisma from '../../shared/prisma';

const createAnnouncement = async (data: any): Promise<Announcement> => {
  const result = await prisma.announcement.create({
    data,
  });
  return result;
};

const getWorkspaceAnnouncements = async (workspaceId: string) => {
  const result = await prisma.announcement.findMany({
    where: { workspaceId },
    include: {
      comments: {
        include: {
          user: { select: { name: true, avatar: true } },
        },
      },
      reactions: true,
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
