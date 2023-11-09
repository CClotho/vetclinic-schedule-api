const Grooming = require("../../models/grooming");

const asyncHandler = require('express-async-handler');



exports.grooming_service_list = asyncHandler(async (req, res) => {
    try {
        const groomingServices = await Grooming.find();
        res.send(groomingServices);
    } catch (error) {
        res.status(500).send({ message: 'Server error' });
    }
});

exports.create_grooming = asyncHandler(async (req, res) => {
  
  console.log('Inside create_grooming. Request body:', req.body);

  const { name, sizes, description } = req.body;
  const newGrooming = new Grooming({
    name,
    sizes,
    description
  });

  await newGrooming.save();
  res.status(201).json({ message: 'Grooming service added successfully!' });
});


exports.edit_grooming = asyncHandler(async (req, res) => {
    try {
        //const { id } = req.params; I can just add this if my client side router is :id dynamically as well but il just display the services in one page

        const grooming = await Grooming.findById(req.body.id);

        if (!grooming) {
            return res.status(404).send({ message: 'Grooming service not found' });
        }

        // Update fields if they are provided in the request
        if (req.body.name) grooming.name = req.body.name;
        if (req.body.sizes) grooming.sizes = req.body.sizes;
        if (req.body.description) grooming.description = req.body.description;

        await grooming.save();

        res.send({ message: 'Grooming service updated successfully!', grooming });
    } catch (error) {
        res.status(500).send({ message: 'Server error' });
    }
});


exports.delete_grooming = asyncHandler(async (req, res) => {
    try {
        const { id } = req.body;

        const groomingService = await Grooming.findById(id);

        if (!groomingService) {
            return res.status(404).send({ message: 'Grooming service not found' });
        }

        await groomingService.remove();

        res.send({ message: 'Grooming service deleted successfully!' });
    } catch (error) {
        res.status(500).send({ message: 'Server error' });
    }
});