import express from 'express';
import { validateRequest, authMiddleware } from '../../middlewares';  // ← এটা এভাবেই থাকবে
import { AuthController } from './auth.controller';
import { registerSchema, loginSchema } from './auth.validation';

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [CUSTOMER, TECHNICIAN, ADMIN]
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', validateRequest(registerSchema), AuthController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns token
 */
router.post('/login', validateRequest(loginSchema), AuthController.login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current logged-in user details
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 */
router.get('/me', authMiddleware, AuthController.getMe);

export default router;