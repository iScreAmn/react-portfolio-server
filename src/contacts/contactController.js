import { validationResult } from 'express-validator';
import { sendContactEmail } from './contactService.js';
import { isSpamMessage } from './spamGuard.js';

export const handleContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errList = errors.array().map((e) => ({
        path: e.path || e.param,
        msg: e.msg
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errList
      });
    }

    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: 'Email configuration is missing. Please contact administrator.'
      });
    }

    const { name, contactMethod, contactValue, message, captcha } = req.body;

    if (captcha !== 'portfolio2024') {
      return res.status(400).json({
        success: false,
        message: 'CAPTCHA verification failed'
      });
    }

    if (isSpamMessage({ message })) {
      return res.status(400).json({
        success: false,
        message: 'Spam detected. Please revise your message.'
      });
    }

    await sendContactEmail({ name, contactMethod, contactValue, message });

    res.status(200).json({
      success: true,
      message: 'Message sent successfully!'
    });
  } catch (error) {
    console.error('Email sending error:', error);
    if (error.code === 'EAUTH') {
      return res.status(500).json({
        success: false,
        message: 'Email authentication failed. Please check credentials.'
      });
    }
    if (error.code === 'ECONNECTION') {
      return res.status(500).json({
        success: false,
        message: 'Email server connection failed. Please try again later.'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
};
