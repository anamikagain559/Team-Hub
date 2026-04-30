import { z } from 'zod';

const create = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    accentColor: z.string().optional(),
  }),
});

const invite = z.object({
  body: z.object({
    email: z.string().email(),
    role: z.enum(['ADMIN', 'MEMBER']).optional(),
  }),
});

export const WorkspaceValidation = {
  create,
  invite,
};
