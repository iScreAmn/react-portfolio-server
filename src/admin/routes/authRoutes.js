import express from 'express';
import rateLimit from 'express-rate-limit';
import { login } from '../controllers/authController.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, login);

export default router;
