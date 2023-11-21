const jwt = require('jsonwebtoken');


function generateToken(user, client) {
    const payload = {
        id: user._id,
        username: user.username,
        role: user.role,
        ...(client && { client: client})
    };
    
    const token = jwt.sign(payload, process.env.S_KEY, { expiresIn: '3h' });
    return token;
}



/* 
function generateToken(user, client) {
    // The payload usually contains the user ID and some other data
    const payload = {
        id: user._id,
        username: user.username,
        role: user.role,
        client: client._id
    }
    
    // Sign the token
    const token = jwt.sign(payload, process.env.S_KEY, {
        expiresIn: '3h' // token will expire in 3 hour
    });

    return token;
} */

module.exports = {
   generateToken
}
  