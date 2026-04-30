import { z } from 'zod';

const create = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    workspaceId: z.string().uuid(),
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
  }),
});

export const GoalValidation = {
  create,
  updateStatus,
  createMilestone,
};
