const { body } = require('express-validator');
const { DateTime } = require('luxon');
const mongoose = require("mongoose");

const appointmentValidationRules = () => {
  return [
    body('client').notEmpty().withMessage('Client is required').bail()
      .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid client ID'),
    body('pet').notEmpty().withMessage('Pet is required').bail()
      .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid pet ID'),
    body('date').custom((value, { req }) => {
      if (!DateTime.fromISO(value).isValid) {
        throw new Error('Invalid date format');
      }
      return true;
    }),
    body('doctor').optional().custom(value => !value || mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid doctor ID'),
    body('service_type').isIn(['grooming', 'treatment']).withMessage('Invalid service type'),
    body('services').optional().isArray().bail()
      .custom(value => value.every(id => mongoose.Types.ObjectId.isValid(id))).withMessage('Invalid service ID'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
    body('priority').optional().isIn(['High', 'Low', 'Medium']).withMessage('Invalid priority value'),
    body('status').optional().isIn(['pending', 'approved', 'declined', 'inProgress', 'finished', 'cancelled', 'noShow', 'reschedule']).withMessage('Invalid status value')
  ];
};

module.exports = {
  appointmentValidationRules
};












// Old Validation
/* const { body,  } = require('express-validator');
const { DateTime } = require('luxon');

const appointmentValidationRules = () => {
  return [
    body('client').notEmpty().withMessage('Client is required'),
    body('pet').notEmpty().withMessage('Pet is required'),
    body('date').custom((value, { req }) => {
      if (!DateTime.fromISO(value).isValid) {
          throw new Error('Invalid date format');
      }
      return true;
  }),
    body('doctor').optional().isString().withMessage('Doctor must be a string'),
    body('service_type').isIn(['grooming', 'treatment']).withMessage('Invalid service type'),
    body('services').optional().isArray().withMessage('Services must be an array'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
    body('priority').optional().isIn(['High', 'Low', 'Medium']).withMessage('Invalid priority value'),
    body('status').optional().isIn(['pending', 'approved', 'declined', 'inProgress', 'finished', 'cancelled', 'noShow', 'reschedule']).withMessage('Invalid status value')
  ];
};

module.exports = {
    appointmentValidationRules
} */