import { body } from "express-validator";

export const userValidation = [
  body('username')
    .isAlpha().withMessage('Username must contain only letters')
    .isLength({ min: 4, max: 32 }).withMessage('Username must be between 4 and 32 characters').trim().escape(),

  body('email')
    .isEmail().withMessage('Please enter a valid email!').trim(),

  body('password')
    .matches(/[0-9A-Za-z]/).withMessage('Password must contain letters and numbers')
    .isLength({ min: 8, max: 40 }).withMessage('Password must be between 8 and 40 characters'),
];

export const userResetValidation = [
  body('password')
    .matches(/[0-9A-Za-z]/).withMessage('Password must contain letters and numbers')
    .isLength({ min: 8, max: 40 }).withMessage('Password must be between 8 and 40 characters'),
];

export const productValidation = [
  body('title')
    .isAlpha().withMessage('Title must contain only letters')
    .isLength({ max: 32 }).withMessage('Username must be between 4 and 32 characters').trim().escape(),

  body('price')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number')
    .toFloat(),

  body('description')
    .matches(/[0-9A-Za-z]/).withMessage('Password must contain letters and numbers')
    .isLength({ min: 2, max: 120 }).withMessage('Description must be between 2 and 120 characters').escape(),
  body('image')
      .isString()
      .withMessage('Image must be a string (e.g., URL or base64).')
];