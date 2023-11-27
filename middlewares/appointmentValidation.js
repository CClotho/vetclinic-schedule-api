const { body } = require('express-validator');
const { DateTime } = require('luxon');
const mongoose = require("mongoose");

const appointmentValidationRules = () => {
  return [
    // Validate client ID
    body('data.client')
      .notEmpty().withMessage('Client is required')
      .bail()
      .custom(clientId => mongoose.Types.ObjectId.isValid(clientId))
      .withMessage('Invalid client ID'),

    // Validate pet ID
    body('data.pet')
      .notEmpty().withMessage('Pet is required')
      .bail()
      .custom(petId => mongoose.Types.ObjectId.isValid(petId))
      .withMessage('Invalid pet ID'),

    // Validate date
    body('data.date')
      .notEmpty().withMessage('Date is required')
      .bail()
      .isISO8601().withMessage('Invalid date format'),

    // Validate service type
    body('data.service_type')
      .notEmpty().withMessage('Service type is required')
      .bail()
      .isIn(['grooming', 'treatment']).withMessage('Invalid service type'),

    // Validate services array
    body('data.services')
      .isArray().withMessage('Services must be an array')
      .bail()
      .custom(services => services.every(serviceId => mongoose.Types.ObjectId.isValid(serviceId)))
      .withMessage('Invalid service ID(s)'),

    // Conditional validation for size (only if service type is grooming)
    body('data.size')
      .if(body('service_type').equals('grooming'))
      .custom(sizeId => mongoose.Types.ObjectId.isValid(sizeId))
      .withMessage('Invalid size ID'),

    // Validate status
    body('data.status')
      .notEmpty().withMessage('Status is required')
      .bail()
      .isIn(['pending', 'approved', 'declined', 'started', 'finished', 'cancelled', 'noShow', 'reschedule'])
      .withMessage('Invalid status'),
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