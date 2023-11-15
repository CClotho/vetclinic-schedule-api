
const { body, checkSchema } = require('express-validator');

const GroomingValidationRules = () => {
  return [
    body('name')
      .notEmpty().withMessage('Name is required.')
      .isString().withMessage('Name must be a string.')
      .trim().escape(),

    body('description')
      .notEmpty().withMessage('Description is required.')
      .isString().withMessage('Description must be a string.')
      .trim().escape(),

  
  ];
}

const GroomingDeleteValidationRules = () => {
    return [
      body('id')
        .notEmpty().withMessage('ID is required.')
        .isMongoId().withMessage('ID is not a valid MongoDB ID.')
    ];
  }
module.exports = {
    GroomingValidationRules,
    GroomingDeleteValidationRules
   
}








/* 
The notation sizes.*.size is used to validate arrays of objects in the request. In this context, sizes is an array, and each element of the array is an object that has a size property.

sizes: Refers to the array.
*: Refers to each element of the array.
size: Refers to the size property of the object.
So, sizes.*.size means "the size property of each object in the sizes array". 


{
  "sizes": [
    { "size": "small", "price": 10, "details": "some details" },
    { "size": "medium", "price": 20, "details": "some other details" }
  ]
}


*/