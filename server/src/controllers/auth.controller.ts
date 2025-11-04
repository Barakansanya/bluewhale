// ============================================
// FILE: server/src/controllers/auth.controller.ts
// ============================================
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response.utils';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, result, 'Registration successful', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, 'Login successful');
    } catch (error: any) {
      sendError(res, error.message, 401);
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const profile = await authService.getProfile(userId);
      sendSuccess(res, profile);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    // With JWT, logout is handled client-side by removing token
    // This endpoint is optional for future session management
    sendSuccess(res, null, 'Logout successful');
  }
}