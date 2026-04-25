import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const signToken = (payload: object) => 
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);

export const generateToken = signToken;

export const verifyToken = (token: string) => 
  jwt.verify(token, JWT_SECRET);
