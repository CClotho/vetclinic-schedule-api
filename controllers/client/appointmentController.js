const Client = require("../../models/client");
const Appointment = require("../../models/appointment");
const Treatment = require("../../models/treatment");
const Grooming = require("../../models/grooming");
const asyncHandler = require('express-async-handler');
const PetSize = require("../../models/petSize")


// in main app.use("admin", adminRouter)


//Require  admin controller modules



//create appointment
exports.create_client_appointment = asyncHandler(async (req, res) => {
    // ... extract client ID from JWT, other details from req.body ...

    try {
        console.log("Received data:", req.body);
        const { pet, date, service_type, services,  status,size } = req.body;
        
      
        // Extract client ID from JWT
        // find clientId where it's === to req.user._id

        const clientId = await Client.findOne({_id: req.user.client._id})
        console.log(clientId) 
        // Format services array
    

        const newAppointment = new Appointment({
            client: req.user.client,
            pet: pet,
            date:date,
            service_type: service_type,
            services: services,
            status: status,
            // Add other fields if necessary
        });

        if (service_type === 'grooming') {
            newAppointment.size = size;
        }
  
        await newAppointment.save();
 

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
        client: req.user.client._id, 
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

    try {
        // Find all appointments for the client for today
        const appointments = await Appointment.find({
            client: req.user.client._id,
            date: {
                $gte: today,
                $lt: tomorrow
            },
            $or: [
                { status: "approved" },
                { status: "started" },
                { status: "finished" },
                { status: "paused" },
            ]
        })
        .populate([
            { path: 'client', select: 'first_name last_name' }, 
            { path: 'pet', select: 'pet_name' }, 
            { path: 'doctor', select: 'first_name' },
            { path: 'services' },
        ])
        .lean();

        if (appointments.length === 0) {
            return res.status(200).json({
                message: 'No appointments for today',
                groomingAppointments: [],
                treatmentAppointments: []
            });
        }

        // Separate and sort grooming and treatment appointments
        const groomingAppointments = appointments.filter(appointment => appointment.service_type === 'grooming');
        const treatmentAppointments = appointments.filter(appointment => appointment.service_type === 'treatment');

        // Return only the appointment types that exist for the client
        res.json({
            groomingAppointments: groomingAppointments.length > 0 ? groomingAppointments : [],
            treatmentAppointments: treatmentAppointments.length > 0 ? treatmentAppointments : [],
        });

    } catch (err) {
        console.error(`Error fetching appointments queue today: ${err}`);
        res.status(500).send(`Error fetching appointments queue today: ${err}`);
    }
});


// Fetch pending appointments
exports.get_pending_appointments = asyncHandler(async (req, res) => {
     let pendingAppointments = await Appointment.find({ status: 'pending' })
        .populate({ path: 'client', select: 'first_name last_name' })
        .populate({ path: 'pet', select: 'pet_name' })
        .populate({ path: 'services' }) // Populate services as ObjectIds
        .populate({ path: 'size' }) // Populate size for grooming
        .lean();

  

    res.json(pendingAppointments);
})


exports.appointment_history = asyncHandler(async (req, res) => {
    try {
        const appointments = await Appointment.find({
            client: req.user.client._id, // Condition for matching the client ID
            $or: [
                { status: "approved" },
                { status: "started" },
                { status: "finished" },
                { status: "paused" },
                { status: "declined" },
                { status: "noShow" },
                { status: "reschedule" },
            ]
        })
        .populate([
            { path: 'client', select: 'first_name last_name' }, 
            { path: 'pet', select: 'pet_name' }, 
            { path: 'doctor', select: 'first_name' },
            { path: 'services' },
            { path: 'size' }, 
        ])
        .sort({ date: -1 })  // This will sort the appointments by the 'date' field in descending order
        .lean();

        res.json(appointments);
    } catch (err) {
        console.error('Error fetching appointment history:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
