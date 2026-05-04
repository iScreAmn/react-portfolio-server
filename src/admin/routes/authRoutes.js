import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, changePassword } from '../controllers/authController.js';
import { requireAdminJwt } from '../middleware/adminJwtAuth.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, login);
router.post('/change-password', requireAdminJwt, changePassword);

export default router;
