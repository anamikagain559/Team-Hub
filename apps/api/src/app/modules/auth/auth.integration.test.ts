import request from 'supertest';
import app from '../../../app';
import { AuthService } from './auth.service';

// Mock the service so we don't need a real DB for integration test
jest.mock('./auth.service');

describe('Auth Integration Tests', () => {
  describe('POST /api/v1/auth/login', () => {
    it('should return 200 and accessToken on successful login', async () => {
      (AuthService.loginUser as jest.Mock).mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken', 'mock-access-token');
      expect(response.header['set-cookie']).toBeDefined();
    });

    it('should return 400/500 if login fails', async () => {
      (AuthService.loginUser as jest.Mock).mockRejectedValue(new Error('User does not exist'));

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400); // Because global error handler converts it
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User does not exist');
    });
  });
});
