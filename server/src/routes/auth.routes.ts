// ============================================
// FILE: server/src/routes/auth.routes.ts
// ============================================
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validators';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', validate(registerSchema), (req, res) =>
  authController.register(req, res)
);

router.post('/login', validate(loginSchema), (req, res) =>
  authController.login(req, res)
);

// Protected routes
router.get('/profile', authenticate, (req, res) =>
  authController.getProfile(req, res)
);

router.post('/logout', authenticate, (req, res) =>
  authController.logout(req, res)
);

export default router;