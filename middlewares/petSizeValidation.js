const { body} = require('express-validator');

const  petSizeValidation = () => {
    return [
    body('size')
        .trim()
        .notEmpty().withMessage('Size is required')
        .isString().withMessage('Size must be a string'),
    // Validate 'description' (optional)
    body('description')
        .optional({ checkFalsy: true })
        .trim()
        .isString().withMessage('Description must be a string'),

    // Validate 'price' (optional)
    body('price')
        .optional({ checkFalsy: true })
        .isNumeric().withMessage('Price must be a number')
        .toFloat(),

    ]
}

module.exports = {
    petSizeValidation
};
  
  

