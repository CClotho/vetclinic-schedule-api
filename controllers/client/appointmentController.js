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
       
    
        const clientAppointment = await Appointment.findOne({
            client: req.user.client._id,
            date: {
                $gte: today,
                $lt: tomorrow
            },
            status: "approved",
        })
        console.log(clientAppointment)
    
        if (clientAppointment) {
            const appointments = await Appointment.find({
                date: {
                    $gte: today,
                    $lt: tomorrow
                },
                $or: [{ status: "approved" }, { status: "started" }, { status: "started" }, { status: "finished" }]
            })

            .populate([
                { path: 'client', select: 'first_name last_name' }, // Adjust as per your Client schema
                { path: 'pet', select: 'pet_name' }, // Adjust as per your Pet schema
                { path: 'doctor', select: 'first_name' },
                { path: 'services' },// Populate services as ObjectIds
                { path: 'size' }, // Adjust as per your Doctor schema
        
            ])
            .lean();
        

            appointments.forEach(appointment => {
                console.log('Appointment client ID:', appointment.client._id.toString());
                console.log('Logged-in client ID:', req.user.client._id.toString());
                appointment.isClientAppointment = appointment.client._id.toString() === req.user.client.toString();gc
               
            });
            
            const modifiedAppointments = appointments.map(appointment => ({
                ...appointment,
                isClientAppointment: appointment.client._id.toString() === req.user.client._id.toString()
            }));
            
            // Separating grooming and treatment appointments
            const groomingAppointments = modifiedAppointments.filter(appointment => appointment.service_type === 'grooming');
            const treatmentAppointments = modifiedAppointments.filter(appointment => appointment.service_type === 'treatment');
 
             // Respond with the separated lists
            res.json({
                groomingAppointments,
                treatmentAppointments
            });
        } else {
            res.status(403).send('You currently do not have an appointment for today.');
        }

    }
    catch(err) {
        console.log(err)
        res.status(404).send(`Error fetching appointments queue today: ${ err}`);
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
