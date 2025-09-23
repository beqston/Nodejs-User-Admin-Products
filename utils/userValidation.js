import { body } from "express-validator";

export const userValidation = [
  body('username')
    .isAlpha().withMessage('Username must contain only letters')
    .isLength({ min: 4, max: 32 }).withMessage('Username must be between 4 and 32 characters'),

  body('email')
    .isEmail().withMessage('Please enter a valid email!'),

  body('password')
    .matches(/[0-9A-Za-z]/).withMessage('Password must contain letters and numbers')
    .isLength({ min: 8, max: 40 }).withMessage('Password must be between 8 and 40 characters'),
];

export const userResetValidation = [
  body('password')
    .matches(/[0-9A-Za-z]/).withMessage('Password must contain letters and numbers')
    .isLength({ min: 8, max: 40 }).withMessage('Password must be between 8 and 40 characters'),
];