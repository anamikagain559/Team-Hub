import { z } from 'zod';

const register = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
  }),
});

const login = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

const refreshToken = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Refresh token is required',
    }),
  }),
});

export const AuthValidation = {
  register,
  login,
  refreshToken,
};
