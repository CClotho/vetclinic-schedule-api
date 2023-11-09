const jwt = require('jsonwebtoken');

function generateToken(user) {
    // The payload usually contains the user ID and some other data
    const payload = {
        id: user._id,
        username: user.username,
        role: user.role
    };
    
    // Sign the token
    const token = jwt.sign(payload, process.env.S_KEY, {
        expiresIn: '3h' // token will expire in 3 hour
    });

    return token;
}

module.exports = {
   generateToken
}
  