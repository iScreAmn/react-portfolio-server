import { validationResult } from 'express-validator';
import { sendCalculatorEmail } from '../services/calculatorService.js';
import { sendCalculatorTelegramNotification } from '../../telegram/services/notifications.js';

export const handleCalculator = async (req, res) => {
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

    const {
      name,
      contact,
      message,
      projectType,
      goals,
      scope,
      designApproach,
      features,
      content,
      timeline,
      support
    } = req.body;

    const calculatorData = {
      name: name.trim(),
      contact: contact.trim(),
      message: (message ?? '').trim(),
      projectType: projectType || '',
      goals: goals || [],
      scope: scope || '',
      designApproach: designApproach || '',
      features: features || [],
      content: content || '',
      timeline: timeline || '',
      support: support || '',
      submitted_at: new Date().toLocaleString('en-GB', {
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };

    const [emailResult, telegramResult] = await Promise.allSettled([
      sendCalculatorEmail(calculatorData),
      sendCalculatorTelegramNotification(calculatorData)
    ]);

    if (telegramResult.status === 'fulfilled') {
      console.log('Calculator telegram notification result:', telegramResult.value);
    } else {
      console.error(
        'Calculator telegram notification failed:',
        telegramResult.reason?.message || telegramResult.reason,
        telegramResult.reason?.details || ''
      );
    }

    if (emailResult.status === 'rejected') {
      console.error('Calculator email failed:', emailResult.reason?.message || emailResult.reason);
    }

    const deliveryOk = emailResult.status === 'fulfilled' || telegramResult.status === 'fulfilled';
    if (!deliveryOk) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again later.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Calculator request sent successfully!'
    });
  } catch (error) {
    console.error('Calculator error:', error);
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
