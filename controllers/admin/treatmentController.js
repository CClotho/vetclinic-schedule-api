const Treatment = require("../../models/treatment");
const asyncHandler = require('express-async-handler');
//const io = require('../../bin/www');



exports.create_treatment = asyncHandler(async (req, res) => {
  

  console.log('Inside create_treatment. Request body:', req.body);


 // const avail =  "true";
  const { name, price, description , availability} = req.body;
  const newTreatment = new Treatment({
    name,
    price,
    description,
    availability,
  });

  //io.emit('new-treatment', newTreatment);
  await newTreatment.save();
  res.status(201).json({ message: 'Treatment added successfully!' });
})



exports.edit_treatment = asyncHandler(async (req, res) => {
  try {
      const { _id, name, price, description, availability } = req.body; //directly from the form
      //const { _id, name, price, description } = req.body.updatedData; //  form values passed the destructured from the object


      const treatmentService = await Treatment.findById(_id);

      if (!treatmentService) {
          return res.status(404).send({ message: 'Treatment service not found' });
      }

      // Update the fields only if they are provided
    if (name !== undefined) {
        treatmentService.name = name;
    }
    if (price !== undefined) {
        treatmentService.price = price;
    }
    if (description !== undefined) {
        treatmentService.description = description;
    }
    if (availability !== undefined) {
      treatmentService.availability = availability;
    }
      await treatmentService.save();

      res.send({ message: 'Treatment service updated successfully!' , treatment: treatmentService });
  } catch (error) {
      res.status(500).send({ message: 'Server error' });
  }
});


exports.delete_treatment = asyncHandler(async (req, res) => {
  try {
      const { id } = req.body;  // Assuming you're sending the ID in the request body

      const treatmentService = await Treatment.findById(id);

      if (!treatmentService === 'undefined') {
          return res.status(404).send({ message: 'Treatment service not found' });
      }

      const deleteTreatment = await Treatment.findByIdAndDelete(id)

      res.send({ message: 'Treatment service deleted successfully!' , treatment: deleteTreatment});
  } catch (error) {
      res.status(500).send({ message: 'Server error' });
  }
});