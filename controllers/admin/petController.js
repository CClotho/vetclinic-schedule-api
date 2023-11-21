const asyncHandler = require('express-async-handler');
const Pet = require("../../models/pet");
const Client = require("../../models/client");



exports.create_pet = asyncHandler(async(req, res) => {
  try {
      const { type, pet_name, breed, gender, owner } = req.body;
    
      const newPet = new Pet({
          pet_name,
          type,
          breed,
          gender,
          owner // Assuming this is the ID of the Client document
      });

      // Check if a file was uploaded
      if (req.file) {
          newPet.pet_photo = {
              data: req.file.buffer,
              contentType: req.file.mimetype
          };
      }

      // Find the client and update their pets array
      const client = await Client.findOne({ _id: owner });
      
      if (!client) {
          return res.status(404).json({ message: "Client not found." });
      }
      // Save the new pet
      const savedPet = await newPet.save();

      

      // Add the new pet's ID to the client's pets array
      client.pets.push(savedPet._id);

      // Save the updated client document
      await client.save();

      res.status(201).json({ message: 'Pet added successfully!', pet: savedPet });
  } catch (error) {
      console.error('Error creating pet:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});



  // Link in client side
  exports.update_pet = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const pet = await Pet.findById(id);

        if (!pet) {
            return res.status(404).send({ message: 'Pet not found' });
        }

        // Update fields if they are provided in the request
        if (req.body.pet_name) pet.pet_name = req.body.pet_name;
        if (req.body.breed) pet.breed = req.body.breed;
        if (req.body.gender) pet.gender = req.body.gender;
        if(req.body.type) pet.gender = req.body.type
        // If there's a new photo uploaded, update it. 
        // This assumes you're using something like multer for file uploads.
        if (req.file) {
            pet.pet_photo.data = req.file.buffer;
            pet.pet_photo.contentType = req.file.mimetype;
        }

        await pet.save();

        res.send({ message: 'Pet updated successfully!', pet });
    } catch (error) {
        res.status(500).send({ message: 'Server error' });
    }
});
  


exports.delete_pet = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const pet = await Pet.findById(id);

        if (!pet) {
            return res.status(404).send({ message: 'Pet not found' });
        }

        await pet.remove();

        res.send({ message: 'Pet deleted successfully!' });
    } catch (error) {
        res.status(500).send({ message: 'Server error' });
    }
});