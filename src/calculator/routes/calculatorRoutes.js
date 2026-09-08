import express from 'express';
import rateLimit from 'express-rate-limit';
import { calculatorValidationRules } from '../validators/calculatorValidator.js';
import { handleCalculator } from '../controllers/calculatorController.js';

const router = express.Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', limiter, calculatorValidationRules, handleCalculator);

export default router;
