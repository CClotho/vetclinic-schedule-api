
const asyncHandler = require('express-async-handler');
const Client = require("../../models/client");


exports.get_profile = asyncHandler(async(req, res) => {
    try {
      // we use user field in client to reference from users collection 
      // we use client id in creating appointments
      
         console.log("Profile ID:" , req.user._id)
        const client = await Client.findOne({user:req.user._id});
        console.log(client);
        console.log('User ID from passport:', req.user._id);
           
        if(!client) {
                return res.status(401).json({ error: 'Client not found.' });
            }
           
        const clientInfo = await Client.findOne({user:req.user._id})
        .populate({path:'pets', select: "pet_name breed gender"})
        
        return res.status(200).json( clientInfo );
    } catch (error) {
        console.error('Error in fetching profile details:', error);
        return res.status(404).json({ error: `An error occurred: ${error.message}` });
    }
});
