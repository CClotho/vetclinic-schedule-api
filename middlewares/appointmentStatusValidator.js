

const { body } = require('express-validator');

const updateAppointmentValidation = [
    body('status').optional().isIn(['pending', 'approved', 'declined', 'started', 'finished', 'cancelled', 'noShow', 'reschedule']),
    body('arrivalTime').optional().custom((value, { req }) => {
        if (!value.match(/^\d{2}:\d{2}$/)) {
            throw new Error('Invalid time format');
        }
        return true;
    }),
    body('queuePosition').optional().isInt({ min: 1 }),
    body('services').optional().isArray(),
    body('resetDuration').optional().isBoolean(),
    // Add more validations as needed
];

const updateStatusValidation = [
   
    body('newStatus').isIn(['approved', 'declined']).withMessage('Invalid status value')
  ];
  

  module.exports = {
    updateStatusValidation,
    updateAppointmentValidation
  }