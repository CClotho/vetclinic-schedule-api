function ensureRole(role) {
    return function(req, res, next) {
        console.log('Checking role:', req.user);

        // Assuming 'req.user' contains the authenticated user's information
        if (req.user && req.user.role === role) {
            return next();
        } else {
            return res.status(403).json({ error: "Access denied. You're not authorized to perform this action." });
        }
    };
}




// example of using this middleware


/* router.get('/client/dashboard', 
    passport.authenticate('jwt', { session: false }),
    ensureRole('client'),
    async (req, res) => {
        // ... your route logic here ...
    }
);
 */

module.exports = {
    ensureRole
}