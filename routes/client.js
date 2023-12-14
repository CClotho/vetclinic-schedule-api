const express = require("express");
const router = express.Router();
const {validate} =  require('../middlewares/validator');
const passport = require("passport");
// if appointment status is still pending, the user can delete it else cant
// if during appointment user can't come they will request to cancel the appointment because they can't come

const appointment_controller = require("../controllers/client/appointmentController");
const pet_controller = require("../controllers/client/petController");
const client_controller = require("../controllers/client/profileController");


//POST request for creating new appointment for a client through form
router.post("/appointment/create",
passport.authenticate('jwt', { session: false }),
validate, 
appointment_controller.create_client_appointment)


// FOR PETS
// Get list of pets of the client
router.get("/pets",
passport.authenticate('jwt', { session: false }),
validate, 
pet_controller.pet_list)


// Get todays appointment in queue  ( fetch all appointments including other client appointments for today)

router.get("/appointments/today/queue",
passport.authenticate('jwt', { session: false }), 
appointment_controller.appointment_today_queue)

router.get("/appointments/history",
passport.authenticate('jwt', { session: false }), 
appointment_controller.appointment_history)

//Get client's profile
router.get('/profile',
passport.authenticate('jwt', { session: false }),
 client_controller.get_profile)


 router.get("/appointments/pending", 
 passport.authenticate('jwt', { session: false }),
 appointment_controller.get_pending_appointments)



/* Get specific pet of the client
router.get("/pets/:id", pet_controller.pet_list) */

/* 
// FOR APPOINTMENTS
router.get("appointments/today", appointment_controller.appointments_today_list)

// FOR PROFILE




// GET all clients appointments that are approved for the week sorted by date
//add month filter
router.get("appointments/week", appointment_controller.appointment_week_list)

// GET all clients appointments that are approved for the month sorted by date
// add month filter
router.get("appointments/month", appointment_controller.appointments_month_list)

//Get all appointments that are pending today sorted by date
// add month filter
router.get("appointments/pending/today", appointment_controller.appointments_pending_today_list)

//Get all appointments that are pending for the week sorted by date 
router.get("appointments/pending/week", appointment_controller.appointments_pending_week_list)

// Get all appointments that are pending for the month sorted by date
router.get("appointment/pending/month", appointment_controller.appointments_pending_month_list)

// GET all appointments that are declined sorted by date
router.get("appointments/declined", appointment_controller.appointments_declined_list)

// GET all appointments that are cancelled sorted by date
router.get("appointments/cancelled", appointment_controller.appointments_cancelled_list)

//Get all appointments that are reschedule sorted by date
router.get("appointments/reschedule", appointment_controller.appointments_reschedule_list)

// Get all appointments that are finished sorted by date
router.get("appointments/finished", appointment_controller.appointments_finished_list)


//POST request for cancellation of appointment through form
router.post("/appointments/:id/cancel",appointment_controller.appointments_cancel)


// FOR SERVICE

// GET list of services for grooming 
router.get('service/grooming', service_controller.grooming_service_list)

// GET list of services for treatment
router.get('service/treatment', service_controller.treatment_service_list)

*/

module.exports = router; 