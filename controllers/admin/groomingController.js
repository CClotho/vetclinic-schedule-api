const Grooming = require("../../models/grooming");
const PetSize = require('../../models/petSize');
const asyncHandler = require('express-async-handler');



exports.grooming_service_list = asyncHandler(async (req, res) => {
    try {



        const groomingServices = await Grooming.find({availability: 'true'}).populate('sizes');
        res.send(groomingServices);
    } catch (error) {
        res.status(500).send({ message: 'Server error' });
    }
});




exports.create_petSize = asyncHandler(async (req, res) => {
    try {
        const { size, description, price } = req.body;

        const isExist = await PetSize.findOne({size: size});
        if(isExist ) {
            return res.status(409).json({ message: "This pet size already exists." });
        

        }

        // Create a new PetSize instance
        const newPetSize = new PetSize({
            size,
            description,
            price
        });

        // Save the new PetSize to the database
        await newPetSize.save();

        // Send a response back
        res.status(201).json({
            message: "New pet size created successfully",
            petSize: newPetSize
        });
    } catch (error) {
        console.error("Error in create_petSize controller:", error);
        res.status(500).send("Server error occurred while creating a new pet size.");
    }
});


exports.create_grooming = asyncHandler(async (req, res) => {
    try {
        const { name, description, availability } = req.body;

        // Check if a grooming service with the same name already exists
        const isExist = await Grooming.findOne({ name: name });
        if (isExist) {
            return res.status(409).json({ message: "This grooming already exists." });
        }

        // Fetch existing pet sizes
        const existingSizes = await PetSize.find({});

        // Log fetched sizes for debugging
        console.log('Existing Sizes:', existingSizes);

        // Extract the _id of each pet size
        let sizeIds = [];
        if (Array.isArray(existingSizes) && existingSizes.length > 0) {
            sizeIds = existingSizes.map(size => size._id);
        }

        // Log sizeIds for debugging
        console.log('Size IDs:', sizeIds);

        // Create a new Grooming instance
        const newGrooming = new Grooming({
            name,
            sizes: sizeIds, // Assign existing size IDs
            description,
            availability
        });

        // Save the new Grooming to the database
        await newGrooming.save();

        res.status(201).json({ message: 'Grooming service added successfully!', grooming: newGrooming });
    } catch (error) {
        console.error("Error in create_grooming controller:", error);
        res.status(500).json({ message: "Server error occurred while creating a new grooming service." });
    }
});


exports.edit_grooming = asyncHandler(async (req, res) => {
    try {
        const { _id, name, price, description, availability } = req.body;

        const grooming = await Grooming.findById(_id);

        if (!grooming) {
            return res.status(404).send({ message: 'Grooming service not found' });
        }

        // Update fields if they are provided in the request
        if (name !== undefined) grooming.name = name;
        if (description !== undefined) grooming.description = description;
        if (price !== undefined) {
            grooming.price = price;
        }
        if (availability !== undefined) {
            grooming.availability = availability;
          }

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