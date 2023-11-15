const Client = require("../../models/client");
const Appointment = require("../../models/appointment");
const asyncHandler = require('express-async-handler');

// in main app.use("admin", adminRouter)


//Require  admin controller modules



//create appointment
exports.create_client_appointment = asyncHandler(async (req, res) => {
    // ... extract client ID from JWT, other details from req.body ...

    try {
        console.log("Received data:", req.body);
        const { pet, date, doctor, service_type, services,  status } = req.body;
        
      
        // Extract client ID from JWT
        // find clientId where it's === to req.user._id

        const clientId = await Client.findOne({user: req.user._id})
        // Format services array
        const formattedServices = services.map(service => ({
            serviceId: service.serviceId,
            serviceType: service_type,
            chosenSize: service_type === 'grooming' ? service.chosenSize : null
        }));

        const newAppointment = new Appointment({
            client: clientId, 
            pet,
            date,
            doctor,
            service_type,
            services: formattedServices,
            status,
            // Add other fields if necessary
        });

        await newAppointment.save();
         // Optionally emit an event to notify admins of a new pending appointment
        //io.emit('newPendingAppointment', newAppointment);

        res.status(201).json({ message: 'Appointment request submitted successfully!', appointment: newAppointment });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ message: 'Server error' });
    }
    
    
    
});


// GET all clients appointment for today


exports.appointments_today_list = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);


    const appointments = await Appointment.find({
        client: req.user._id, // Filter appointments by the logged-in user's ID
        date: {
            $gte: today,
            $lt: tomorrow
        }
    });

    res.json(appointments);
});


exports.appointment_today_queue = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const clientAppointment = await Appointment.findOne({
        client: req.user._id, // from JWT token in headers
        date: {
            $gte: today,
            $lt: tomorrow
        }
    });

    if (clientAppointment) {
        const appointments = await Appointment.find({
            date: {
                $gte: today,
                $lt: tomorrow
            }
        }); 
        res.json(appointments);
    } else {
        res.status(404).send('You currently do not have an appointment for today.');
    }
});
