// ============================================
// FILE: server/src/types/express.d.ts
// ============================================
import { JwtPayload } from '../utils/jwt.utils';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}