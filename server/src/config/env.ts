// ============================================
// FILE: server/src/config/env.ts
// ============================================
import dotenv from 'dotenv';
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000'),
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL!,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'bluewhale-super-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Frontend
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // Redis (optional, for sessions)
  REDIS_URL: process.env.REDIS_URL,
};