const { body } = require('express-validator');

const PetValidationRules = () => {
  return [
    body('pet_name')
      .notEmpty().withMessage('Pet name is required.')
      .isString().withMessage('Pet name must be a text.')
      .trim().escape(),

    body('breed')
      .notEmpty().withMessage('Breed is required.')
      .isString().withMessage('Breed must be a text.')
      .trim().escape(),

    body('gender')
      .notEmpty().withMessage('Gender is required.')
      .isIn(['Male', 'Female']).withMessage('Gender must be either Male or Female.'),

    body('owner')
      .notEmpty().withMessage('Owner is required.')
      .isMongoId().withMessage("Client doesn't exist.")
  ];
}


module.exports = {
    PetValidationRules
}