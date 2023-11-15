const Grooming = require("../../models/grooming");
const PetSize = require('../../models/petSize');
const Treatment = require("../../models/treatment");
const asyncHandler = require('express-async-handler');


//const io = require('../../bin/www');


exports.treatment_service_list = asyncHandler(async (req, res) => {
  try {
      const treatmentServices = await Treatment.find({availability: "true"});
      res.send(treatmentServices);
  } catch (error) {
      res.status(500).send({ message: 'Server error' });
  }
});



exports.grooming_service_list = asyncHandler(async (req, res) => {
    try {



        const groomingServices = await Grooming.find({availability: 'true'}).populate('sizes');
        res.send(groomingServices);
    } catch (error) {
        res.status(500).send({ message: 'Server error' });
    }
});




exports.petSize_list = asyncHandler(async (req, res) => {
    try {
        const petSizes = await PetSize.find();
        
        res.send(petSizes);
    } catch (error) {
        res.status(500).send({ message: 'Server error' });
    }
});