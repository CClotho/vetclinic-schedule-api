const Client = require("../../models/client");
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');


//GET list of clients profile
exports.get_client_ids = asyncHandler(async (req, res) => {
    try {
        const clientId = req.params.id;
        console.log(`Client ID: ${clientId}`);

   
       
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ message: 'Invalid client ID' });
        }
        
        const client = await Client.findOne({ _id: clientId })
        .populate({path:'pets', select: "pet_name breed gender"})

       
            

        console.log(client);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.status(200).json(client);
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});




exports.get_client_id_and_pets = asyncHandler(async (req, res) => {
    try {
        
        const clientsInfo = await Client.find({})
        .select('first_name last_name')
        .populate({path:'pets', select: "pet_name breed gender"})
        
        
        res.status(200).json(clientsInfo);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
})

exports.get_clients  = asyncHandler(async (req, res) => {
    
    try {
        // Fetch clients and populate the 'pets' field
        const clients = await Client.find({}).populate({path:'pets', select: "pet_name breed gender"});
        
        res.status(200).json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }


})


//GET list of pets of a client

exports.get_client_pets = asyncHandler(async(req, res) => {
    res.status(200).json({message: 'testing'})
})


//GET a specific profile client based on the url iq or id passed by / <ClientProfile/> component renderer

exports.get_client = asyncHandler(async(req, res) => {
    res.status(200).json({message: 'testing'})
})



// Get a specific profile of client's pet

exports.get_client_pet = asyncHandler(async(req, res) => {
    
       

})

// POST delete a client pet
exports.delete_client_pet = asyncHandler(async(req, res) => {
    res.status(200).json({message: 'testing'})
})

// POST delete a client
exports.delete_client = asyncHandler(async(req, res) => {
    res.status(200).json({message: 'testing'})
})

