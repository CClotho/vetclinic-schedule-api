const express = require("express");
const router = express.Router();
const passport = require("passport");
const treatment_controller = require("../controllers/shared/sharedControllers");
const grooming_controller = require("../controllers/shared/sharedControllers");

// GET list of services for grooming 
router.get('/grooming',
passport.authenticate('jwt', { session: false }), 
grooming_controller.grooming_service_list)

router.get('/grooming/pet-sizes',
passport.authenticate('jwt', { session: false }), 
grooming_controller.petSize_list)


// GET list of services for treatment
router.get('/treatments', 
passport.authenticate('jwt', { session: false }), 
treatment_controller.treatment_service_list)

module.exports = router;