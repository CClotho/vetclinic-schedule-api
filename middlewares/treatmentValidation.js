const { body } = require('express-validator');

const TreatmentValidationRules = () => {
  return [
    body('name')
      .notEmpty().withMessage('Name is required.')
      .isString().withMessage('Name must be a string.')
      .trim().escape(),
      
    body('price')
      .notEmpty().withMessage('Price is required.')
      .isNumeric().withMessage('Price must be a number.')
      .toFloat(),
      
    body('description')
      .notEmpty().withMessage('Description is required.')
      .isString().withMessage('Description must be a string.')
      .trim().escape()
  ];
}

module.exports = {
    TreatmentValidationRules
}