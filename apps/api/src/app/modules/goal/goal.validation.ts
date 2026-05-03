import { z } from 'zod';

const create = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    workspaceId: z.string().uuid(),
    ownerId: z.string().uuid().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  }),
});

const update = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  }),
});

const updateStatus = z.object({
  body: z.object({
    status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  }),
});

const createMilestone = z.object({
  body: z.object({
    title: z.string().min(2),
    progress: z.number().min(0).max(100).optional(),
    workspaceId: z.string().uuid().optional(),
  }),
});

const updateMilestone = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    progress: z.number().min(0).max(100).optional(),
  }),
});

export const GoalValidation = {
  create,
  update,
  updateStatus,
  createMilestone,
  updateMilestone,
};
