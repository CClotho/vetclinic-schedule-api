const { body } = require('express-validator');

const doctorValidationRules = [
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('age').optional().isInt({ min: 0 }).withMessage('Age must be a positive integer'),
  body('gender').isIn(['Female', 'Male']).withMessage('Gender must be either Female or Male'),
  body('contact_number').optional().matches(/^639\d{9}$/).withMessage('Contact number is not valid. It should follow the format 639xxxxxxxxx.'),
];

module.exports = doctorValidationRules;
