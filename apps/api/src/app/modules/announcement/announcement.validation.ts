import { z } from 'zod';

const create = z.object({
  body: z.object({
    title: z.string().min(2),
    content: z.string().min(10),
    isPinned: z.boolean().optional(),
    workspaceId: z.string().uuid(),
  }),
});

const addReaction = z.object({
  body: z.object({
    emoji: z.string(),
  }),
});

const addComment = z.object({
  body: z.object({
    content: z.string().min(1),
  }),
});

export const AnnouncementValidation = {
  create,
  addReaction,
  addComment,
};
