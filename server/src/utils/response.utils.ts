import { Response } from 'express';
export const successResponse = (res: Response, data: any, message = 'Success') => res.json({ success: true, message, data });
export const errorResponse = (res: Response, message = 'Error', status = 500) => res.status(status).json({ success: false, message });
export const sendSuccess = successResponse;
export const sendError = errorResponse;
