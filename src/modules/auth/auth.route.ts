import express from 'express';
import { validateRequest, authMiddleware } from '../../middlewares';  // ← Clean import
import { AuthController } from './auth.controller';
import { registerSchema, loginSchema } from './auth.validation';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.get('/me', authMiddleware, AuthController.getMe);

export default router;