import { AuthService } from './auth.service';
import prisma from '../../shared/prisma';
import bcrypt from 'bcryptjs';
import { jwtHelpers } from '../../helper/jwtHelpers';

// Mock Prisma
jest.mock('../../shared/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock jwtHelpers
jest.mock('../../helper/jwtHelpers', () => ({
  jwtHelpers: {
    generateToken: jest.fn(),
    verifyToken: jest.fn(),
  },
}));

describe('AuthService', () => {
  describe('loginUser', () => {
    it('should throw error if user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(AuthService.loginUser({ email: 'test@test.com', password: 'password' }))
        .rejects
        .toThrow('User does not exist');
    });

    it('should throw error if password does not match', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(AuthService.loginUser({ email: 'test@test.com', password: 'wrong-password' }))
        .rejects
        .toThrow('Password does not match');
    });

    it('should return tokens if login is successful', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'hashed-password',
        role: 'MEMBER',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtHelpers.generateToken as jest.Mock).mockReturnValue('fake-token');

      const result = await AuthService.loginUser({ email: 'test@test.com', password: 'password' });

      expect(result).toHaveProperty('accessToken', 'fake-token');
      expect(result).toHaveProperty('refreshToken', 'fake-token');
    });
  });
});
