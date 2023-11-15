const asyncHandler = require('express-async-handler');
const Pet = require("../../models/pet");


exports.pet_list = asyncHandler(async (req, res) => {
    try {
        console.log(req.user._id)
        const pets = await Pet.find({owner: req.user._id})
        .select("pet_name breed gender")
                
      
        
        res.status(200).json(pets);
    } catch (error) {
        console.error('Error fetching pets:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
})