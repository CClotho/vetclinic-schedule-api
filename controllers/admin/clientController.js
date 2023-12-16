const Client = require("../../models/client");
const User = require("../../models/user");
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
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
        .populate({path:'pets', select: "pet_name breed gender type"})

       
            

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
        .populate({path:'pets', select: "pet_name breed gender type"})
        
        
        res.status(200).json(clientsInfo);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
})

exports.get_clients  = asyncHandler(async (req, res) => {
    
    try {
        // Fetch clients and populate the 'pets' field
        const clients = await Client.find({}).populate({path:'pets', select: "pet_name breed gender type"});
        
        res.status(200).json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }


})

exports.reset_password = asyncHandler(async(req, res)=> {
    const {_id, newPassword } = req.body;
    console.log(_id)
  try {
      // Validate userId and newPassword
      // ...

      // Find the user by ID
      const user = await User.findById(_id);

      if (!user) {
          return res.status(404).json({ error: 'User not found.' });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password
      user.password = hashedPassword;
      await user.save();

      // You might want to log this action or notify the user that their password has been changed
      // ...

      return res.status(200).json({ message: 'Password reset successfully.' });
    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ error: 'An error occurred while resetting the password.' });
    }
})



exports.edit_client_information = asyncHandler(async(req, res) => {

   
    const { _id, first_name, last_name, age, phone_number, email } = req.body;
    console.log(_id)
    try {
        // Find client by ID and update
        const updateData = await Client.findByIdAndUpdate(_id,
            { first_name, last_name, age, phone_number, email },
            { new: true }
            
        )

        if (!updateData) {
            return res.status(404).json({ message: 'Client not found' });
        }

    
        // Send success response
        res.status(200).json({ message: 'Client updated successfully', client: updateData });
    } catch (error) {
        console.error('Error updating client:', );
        res.status(500).json({ message: 'Error updating client', error });
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

// POST delete a client
exports.delete_client = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Client ID is required.' });
    }

    try {
        // Find the client
        const client = await Client.findById(id);

        if (!client) {
            // Attempt to delete user if client not found
            const userDeletionResult = await User.findByIdAndDelete(id);
            if (!userDeletionResult) {
                return res.status(404).json({ message: 'Client or User not found.' });
            }

            return res.status(200).json({ message: 'User deleted successfully.' });
        }

        // Delete all pets associated with the client (if any)
        let petsDeletionResult = { deletedCount: 0 };
        if (client.pets && client.pets.length > 0) {
            petsDeletionResult = await Pet.deleteMany({ _id: { $in: client.pets } });
        }

        // Delete the client
        const clientDeletionResult = await Client.findByIdAndDelete(id);

        // Delete the user associated with the client
        const userDeletionResult = await User.findByIdAndDelete(client.user);

        // If all deletions were successful, send a success response
        res.status(200).json({
            message: 'Client and all associated data have been deleted successfully.',
            petsDeleted: petsDeletionResult.deletedCount,
            userDeleted: userDeletionResult ? 1 : 0,
            clientDeleted: clientDeletionResult ? 1 : 0
        });
    } catch (error) {
        console.error('Error deleting client and associated data:', error);
        res.status(500).json({ message: 'Error deleting client and associated data', error: error.toString() });
    }
});





// Get a specific profile of client's pet

exports.get_client_pet = asyncHandler(async(req, res) => {
    
       

})

// POST delete a client pet
exports.delete_client_pet = asyncHandler(async(req, res) => {
    res.status(200).json({message: 'testing'})
})


