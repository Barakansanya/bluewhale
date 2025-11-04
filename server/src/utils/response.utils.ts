// ============================================
// FILE: server/src/utils/response.utils.ts
// ============================================
import { Response } from 'express';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  error: string,
  statusCode = 400
): Response => {
  const response: ApiResponse = {
    success: false,
    error,
  };
  return res.status(statusCode).json(response);
};