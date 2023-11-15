const { body } = require('express-validator');
const { DateTime } = require('luxon');
const mongoose = require("mongoose");

const appointmentValidationRules = () => {
  return [
    // ...other validations...

    body('services')
      .isArray().withMessage('Services must be an array')
      .custom((services, { req }) => {
        return services.every(service => {
          // Validate the serviceId
          if (!mongoose.Types.ObjectId.isValid(service.serviceId)) {
            throw new Error('Invalid service ID');
          }

          // Validate the serviceType
          if (!['grooming', 'treatment'].includes(service.serviceType)) {
            throw new Error('Invalid service type');
          }

          // Validate the chosenSize for grooming services
          if (service.serviceType === 'grooming') {
            if (!service.chosenSize || !mongoose.Types.ObjectId.isValid(service.chosenSize)) {
              throw new Error('Invalid or missing size ID for grooming service');
            }
          }

          return true;
        });
      }).withMessage('Invalid service data'),

    // ...other validations...
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