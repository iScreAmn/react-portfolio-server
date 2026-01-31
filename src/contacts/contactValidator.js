import { body } from 'express-validator';

export const contactValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('contactMethod')
    .trim()
    .notEmpty()
    .withMessage('Choose a contact method')
    .isIn(['Telegram', 'WhatsApp', 'Email'])
    .withMessage('Choose a valid contact method'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  body('agreeToPrivacy')
    .custom((value) => value === true)
    .withMessage('You must agree to the processing of personal data'),
  body('captcha')
    .notEmpty()
    .withMessage('Please complete the CAPTCHA'),
  body('honeypot')
    .optional({ values: 'falsy' })
    .isEmpty()
    .withMessage('Spam detected'),
];
