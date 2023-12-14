var express = require('express');
const passport = require("passport");
var router = express.Router();
const User =  require('../models/user');
const Doctor =  require('../models/doctor');
const Client =  require('../models/client');
const { UserSignUpValidationRules, validate } = require('../middlewares/validator');
const bcrypt = require('bcryptjs');
const {generateToken} = require('../middlewares/generateToken')


// create reset password for client and admin, by getting old password then new password for verification then hash it

// create new client
router.post("/sign-up", 
    UserSignUpValidationRules(), 
    validate,
    async (req, res, next) => {
      const {first_name, last_name, age, email, confirm_password, username, password, phone_number} = req.body
      bcrypt.hash(password, 10, async (err, hashedPassword) => {
        if (err) {
            return next(err);
        } else {
            try {
                const user = new User({
                    username: username,
                    password: hashedPassword,
                    email: email,
                    role: "client"
                });
  
                // Save the user
                const savedUser = await user.save();
                
                // Now save the doctor with the ObjectId from the user
                const client = new Client({
                    user: savedUser._id,
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    phone_number:  phone_number,
                    age: age,
                });
                console.log("Saving client:", client);

                try {
                    const savedClient = await client.save();
                      // ADD  CONTACT_NUMBER INPUT FOR MONGODB CLIENT SCHEMA atm it was set to not required but should be required
                      
                    
                } catch(clientErr) {
                    // if saving the client fails, remove the saved user
                    console.error("Error saving client:", clientErr);
                    await User.findByIdAndDelete(savedUser._id);
                    throw clientErr; // rethrow the error to be caught by the outer catch block
                }
  
               
  
                return res.status(200).json(
                {message: "You have successfully signed up!",
                 
              });
  
            } catch(err) {
              
            // Send a general error message
            return res.status(500).json({error: { message: "An error occurred while signing up." } });
          };
        } 
    });
       
    }
);


router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Try to find the user by username
    const user = await User.findOne({ username: username });
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Check if the provided password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect Password.' });
    }

    const client = await Client.findOne({ user: user._id });

    // If credentials are valid, generate a JWT token
    const token = generateToken(user, client);
    
    // Send the token as an HTTP-only cookie
    res.cookie('jwt', token, {
        httpOnly: true, 
        maxAge: 10800000 // 3 hour in milliseconds
    });
    
    res.cookie('loggedIn', 'true', { httpOnly: false, maxAge: 10800000 });

    // Return the response with conditional inclusion of client ID
    return res.status(200).json({ 
        message: 'Logged in successfully.', 
        role: user.role, 
        user: user._id, 
        ...(client && { client: client._id }) // Include client ID only if client is not null
    });
});




router.get('/me/profile', passport.authenticate('jwt', { session: false }), validate, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');

    try {
      
        const client = await Client.findOne({user:req.user._id});
        console.log(client);
        console.log('User ID from passport:', req.user._id);
            if (!client) {
                return res.status(401).json({ error: 'Client not found.' });
            }
        
        return res.status(200).json({  first_name: client.first_name, last_name: client.last_name, email: client.email });
    } catch (error) {
        console.error('Error in /me route:', error);
        return res.status(500).json({ error: `An error occurred: ${error.message}` });
    }
});
router.get('/me', passport.authenticate('jwt', { session: false }), validate, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');

    // Access user data directly from req.user
    const loggedInUser = req.user; // User data

    console.log("User's Id:", loggedInUser._id); // Log the user's ID

    // Access and log the client's ID if the client data exists
    if (loggedInUser.client) {
        console.log("Client's ID:", loggedInUser.client._id); // Log the client's ID
    } else {
        console.log("No client associated with this user.");
    }

    try {
        // Return user data and client ID (if client exists)
        return res.status(200).json({ 
            role: loggedInUser.role, 
            user: loggedInUser._id, 
            clientId: loggedInUser.client?._id // Include client ID only if client exists
        });
    } catch (error) {
        console.error('Error in /me route:', error);
        return res.status(500).json({ error: 'An error occurred.' });
    }
});


router.post('/logout', (req, res) => {
    if (!req.cookies || !req.cookies.jwt) {
        return res.status(400).json({ message: 'No user is currently logged in.' });
    }

    // Clear the JWT cookie
    res.clearCookie('jwt', {
        httpOnly: true,
        // secure: true, // Uncomment this if you are using it in production
    });

    res.clearCookie('loggedIn');

    return res.status(200).json({ message: 'Logged out successfully.' });
});






// add keep me log in 
module.exports = router;
