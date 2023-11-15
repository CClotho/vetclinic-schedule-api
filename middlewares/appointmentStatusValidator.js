const { body } = require('express-validator');
const updateStatusValidation = [
   
    body('newStatus').isIn(['approved', 'declined']).withMessage('Invalid status value')
  ];
  

  module.exports = {
    updateStatusValidation
  }