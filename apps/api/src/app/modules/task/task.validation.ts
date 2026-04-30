import { z } from 'zod';

const create = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    assigneeId: z.string().uuid(),
    goalId: z.string().uuid().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    dueDate: z.string().optional(),
  }),
});

const updateStatus = z.object({
  body: z.object({
    status: z.string(),
  }),
});

export const TaskValidation = {
  create,
  updateStatus,
};
