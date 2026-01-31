import express from 'express';
import rateLimit from 'express-rate-limit';
import { contactValidationRules } from './contactValidator.js';
import { handleContact } from './contactController.js';

const router = express.Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', limiter, contactValidationRules, handleContact);

export default router;
