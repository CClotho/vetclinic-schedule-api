const { body, validationResult } = require('express-validator');
const User =  require('../models/user');

// This is for UserSignUpvalidation Only
const UserSignUpValidationRules = () => {
  
  return [
    
    body('first_name').notEmpty().withMessage('First name is required.'),
    body('last_name').notEmpty().withMessage('Last name is required.'),
    body('age').isNumeric().withMessage('Age must be a number.'),
    body('username')
    .notEmpty().withMessage('Username is required.')
    .custom(async (username) => {
      const user = await User.findOne({ username: username });
      if (user) {
        throw new Error('Username already exists.');
      }
      return true;
    }),
    body('email').isEmail().withMessage('Email is not valid.')
    .custom(async (email) => {
      const user = await User.findOne({ email: email });
      if (user) {
        throw new Error('Email already exists.');
      }
      return true;
    }),
    body('phone_number')
    .matches(/^639\d{9}$/).withMessage('Contact number is not valid. It should follow the format 639xxxxxxxxx.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    body('confirm_password').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password.');
      }
      return true;
    }),
  
   
  ]
}

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  console.log("Full Error Objects:", errors.array());
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));
  console.log("Validation Errors:", extractedErrors);
  return res.status(422).json({
    errors: extractedErrors,
  });
}

module.exports = {
  UserSignUpValidationRules,
  validate
}
