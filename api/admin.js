const express = require("express");
const router = express.Router();
const treatment_controller = require("../controllers/admin/treatmentController");
const grooming_controller = require("../controllers/admin/groomingController");
const appointment_controller = require("../controllers/admin/appointmentController");
const client_controller = require("../controllers/admin/clientController");
const pet_controller = require("../controllers/admin/petController");
const doctor_controller = require("../controllers/admin/doctorController")
const passport = require("passport");

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const {ensureRole}= require("../middlewares/checkRole")
const {validate} =  require('../middlewares/validator'); // validate for in general extracting errors from the process
const {TreatmentValidationRules} = require("../middlewares/treatmentValidation") // For treatment service validation
const {GroomingValidationRules, GroomingDeleteValidationRules} = require("../middlewares/groomingValidation")
const {PetValidationRules} = require("../middlewares/petValidation");
const { appointmentValidationRules } = require("../middlewares/appointmentValidation");
const DoctorValidationRules = require("../middlewares/doctorValidation")
// In main app.use("/admin", adminRouter)


//FOR DOCTOR PROFILE

router.post('/add/doctor',
passport.authenticate('jwt', { session: false }),
ensureRole("doctor"),
DoctorValidationRules,
validate,
doctor_controller.create_doctor)


// FOR SERVICE

// GET list of services for grooming 
router.get('/service/grooming',
passport.authenticate('jwt', { session: false }), 
grooming_controller.grooming_service_list)

//POST create a grooming service

router.post("/service/create/grooming",
passport.authenticate('jwt', { session: false }), // This ensures the request is authenticated
ensureRole("doctor"), // This ensures the request is from an admin ( change this later to admin for now doctor because doctor is only avail role)
GroomingValidationRules(), validate,
grooming_controller.create_grooming);

//POST Edit grooming service

// POST update service  for grooming // could be pass by link or form fields 
router.put("/service/edit/grooming",
passport.authenticate('jwt', { session: false }), 
ensureRole("doctor"), 
GroomingValidationRules(), 
validate, grooming_controller.edit_grooming)

// Delete Grooming service

router.delete("/service/grooming/delete",
passport.authenticate('jwt', { session: false }), 
ensureRole("doctor"), 
GroomingDeleteValidationRules(),
validate,
grooming_controller.delete_grooming);


// GET list of services for treatment
router.get('/service/treatments', 
passport.authenticate('jwt', { session: false }), 
treatment_controller.treatment_service_list)

//POST create a treatment 

router.post("/service/create/treatment",
passport.authenticate('jwt', { session: false }), // This ensures the request is authenticated
ensureRole("doctor"), // This ensures that only admin have access to process this
TreatmentValidationRules(),validate,
treatment_controller.create_treatment)

// PUT Edit a treatment 
router.put("/service/edit/treatment",
passport.authenticate('jwt', { session: false }), 
ensureRole("doctor"), 
TreatmentValidationRules(),
validate, treatment_controller.edit_treatment)

// DELETE a treatment
router.delete("/service/treatment/delete", 
passport.authenticate('jwt', { session: false }),
ensureRole("doctor"), 
treatment_controller.delete_treatment);




// POST create a new pet and add it on the client's profile
router.post("/pet/create",
passport.authenticate('jwt', { session: false }), 
ensureRole("doctor"),
upload.single('pet_photo'),
PetValidationRules(),
validate,
pet_controller.create_pet) 

//POST update existing pet
router.put("/pet/:id/update",
 passport.authenticate('jwt', { session: false }), 
ensureRole("admin"), 
PetValidationRules(), 
validate,
pet_controller.update_pet)



// POST delete a pet
router.delete("/pet/delete/:id",
passport.authenticate('jwt', { session: false }), 
ensureRole("admin"), 
 pet_controller.delete_pet)






//POST request for creating new appointment for a client through form
router.post("/appointment/create",
appointmentValidationRules(), 
validate,  
appointment_controller.create_appointment)



/* // Updating arrival and queueing position
router.patch("/appointment/:id/arrival")

//Updating status, start time and duration
router.patch("/appointment/:id/status")
 */


/*
// if through mapped in form can get it via req.body 
// if through url can get it with :id via req.url.params
// client dynamically link with mapped array.map <Link to={`contacts/${contact.id}`}>example

//Require admin controllers module
// create a button for today, week, and month filter
// Create search filter by date and title  in frontend?
// Add  pending requests, declined, reschedule links in the appointments schedule 
// Add notification for every new requests of appointments from clients for admin pov can do notification + 1 icon
//GET all clients appointments that are approved for today sorted by date
// /add month filter

router.get("appointments/today", appointment_controller.appointments_today_list)

// GET all clients appointments that are approved for the week sorted by date
//add month filter
router.get("appointments/week", appointment_controller.appointment_week_list)

// Get todays appointment in queue  ( fetch all appointments including other client appointments for today)

router.get("appointments/today/queue", appointment_controller.appointment_today_queue) // same call with admin's appointments for today

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

//POST requests for updating an appointment of the client through form
router.post("appointments/update", appointment_controller.appointments_update)

//POST requests for updating a status of an appointment of the client through form
// this handles start Time, status, and duration
router.post("appointments/update/status", appointment_controller.appointments_update)

//POST requests for updating the queue position  of the client through form
// this handles arrivalTime and queueing position
router.post("appointments/update/queue", appointment_controller.appointments_queue)
//POST requests for deleting an appointment of a client through form 
router.post("appointments/delete", appointment_controller.appointments_delete)



// FOR HANDLING CLIENTS 
// Display Client names as listed then render next the information to it or open to new link <Link to="`client/:id">

// Create new client, delete, update

//GET list of clients profile

router.get("clients/profile", client_controller.client_profile_list)

//GET a specific profile client based on the url iq or id passed by / <ClientProfile/> component renderer
router.get("client/profile/:id", client_controller.client_profile)

//GET list of pets of a client
router.get("client/profile/:id/pets", client_controller.client_pet_list) //remove this and add retrieve the list of pet of a client together with client/profile

// Get a specific profile of client's pet
router.get("client/profile/:id/pet/:id", client_controller.client_pet_info)

// POST delete a client
router.post("client/:id/delete", client_controller.client_delete)


// FOR HANDLING PETS




 */

module.exports = router;