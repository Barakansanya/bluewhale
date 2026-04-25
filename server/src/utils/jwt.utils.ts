import jwt from 'jsonwebtoken';
import config from '../config';
export const signToken = (p: object) => jwt.sign(p, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN } as any);
export const verifyToken = (t: string) => jwt.verify(t, config.JWT_SECRET);
