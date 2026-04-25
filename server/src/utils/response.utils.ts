import { Response } from 'express';

export const successResponse = (res: Response, data: any, message = 'Success') => {
  return res.json({ success: true, message, data });
};

export const errorResponse = (res: Response, message = 'Error', status = 500) => {
  return res.status(status).json({ success: false, message });
};
