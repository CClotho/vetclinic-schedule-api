const Appointment = require("../../models/appointment");
const Pet = require("../../models/pet");
const Treatment = require("../../models/treatment");
const Grooming = require("../../models/grooming");
const asyncHandler = require('express-async-handler');
const io = require('../../bin/www');
const PetSize = require("../../models/petSize")

const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

exports.appointment_update = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { newStatus } = req.body;

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).send({ message: 'Appointment not found' });
        }

        appointment.status = newStatus;

        if (newStatus === 'inProgress') {
            appointment.startTime = new Date();
        }

        await appointment.save();

        // Calculate duration
        const startTime = DateTime.fromJSDate(appointment.startTime || new Date());
        const now = DateTime.now();
        const totalMinutes = now.diff(startTime, 'minutes').minutes;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.floor(totalMinutes % 60);
        let formattedDuration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

        // Emitting the update to all connected clients
        io.emit('appointmentUpdate', {
            appointmentId: id,
            status: newStatus,
            duration: formattedDuration
        });

        res.send({ message: 'Appointment status updated' });
    } catch (error) {
        res.status(500).send({ message: 'Server error' });
    }
});
// this is for client just testing at admin cuz if admin no need for default status that is passed from form
exports.create_appointment = asyncHandler(async(req, res) => {
    try {
        console.log("Received data:", req.body);
        const { client, pet, date, doctor, service_type, services,  status } = req.body;
        


        // Format services array
        const formattedServices = services.map(service => ({
            serviceId: service.serviceId,
            serviceType: service_type,
            chosenSize: service_type === 'grooming' ? service.chosenSize : null
        }));

        const newAppointment = new Appointment({
            client,
            pet,
            date,
            doctor,
            service_type,
            services: formattedServices,
            status,
            // Add other fields if necessary
        });

        await newAppointment.save();
        res.status(201).json({ message: 'Appointment created successfully!', appointment: newAppointment });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Fetch pending appointments
exports.get_pending_appointments = asyncHandler(async (req, res) => {
    let pendingAppointments = await Appointment.find({ status: 'pending' })
        .populate({ path: 'client', select: 'first_name last_name' }) // Adjust as per your Client schema
        .populate({ path: 'pet', select: 'pet_name' }) 
        .populate('services.serviceId') // Initially populate serviceId
        .lean();

    for (let appointment of pendingAppointments) {
        for (let service of appointment.services) {
            if (service.serviceType === 'grooming') {
                // Populate chosenSize for grooming services
                if (service.chosenSize) {
                    service.chosenSize = await PetSize.findById(service.chosenSize).lean();
                }
                // Populate service details from Grooming model
                service.serviceId = await Grooming.findById(service.serviceId).lean();
            }
            else if (service.serviceType === 'treatment') {
                // Populate service details from Treatment model
                service.serviceId = await Treatment.findById(service.serviceId).lean();
            }
        }
    }

    res.json(pendingAppointments);
});



// Update appointment status
exports.update_appointment_status = asyncHandler(async (req, res) => {
    try {
        const { appointmentId, newStatus } = req.body;

        if (!ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ error: `Invalid appointment ID ${appointmentId}`  });
        }

        const appointmentExist = await Appointment.findOne({ _id: appointmentId });

        
        if(!appointmentExist) {
            return res.status(404).json({ error: "Appointment not found" });
        }
        
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId, 
            { status: newStatus }, 
            { new: true }
        );
    
       
    
        res.json(updatedAppointment);
    } catch (err) {
        console.error("Error updating appointment:", err);
        res.status(500).json({ error: err.message });
    }
});


//Front end logic for updating appointment status




exports.appointments_today_list = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);


    const appointments = await Appointment.find({
        date: {
            $gte: today,
            $lt: tomorrow
        },
        status: "approved" // Only fetch appointments with 'approved' status
    })

    res.json(appointments);
});

exports.appointment_today_queue = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

    let appointments = await Appointment.find({
        date: {
            $gte: today,
            $lt: tomorrow
        },
        status: "approved"
    })
    .populate([
        { path: 'client', select: 'first_name last_name' }, // Adjust as per your Client schema
        { path: 'pet', select: 'pet_name' }, // Adjust as per your Pet schema
        { path: 'doctor', select: 'first_name' } // Adjust as per your Doctor schema
    ])
    .lean();

    for (let appointment of appointments) {
        for (let service of appointment.services) {
            // Manually populating serviceId based on the serviceType
            if (service.serviceType === 'grooming') {
                service.serviceId = await Grooming.findById(service.serviceId).lean();
                if (service.chosenSize) {
                    service.chosenSize = await PetSize.findById(service.chosenSize).lean();
                }
            } else if (service.serviceType === 'treatment') {
                service.serviceId = await Treatment.findById(service.serviceId).lean();
            }
        }
    }



     // Separating grooming and treatment appointments
     const groomingAppointments = appointments.filter(appointment => appointment.service_type === 'grooming');
     const treatmentAppointments = appointments.filter(appointment => appointment.service_type === 'treatment');
 
     // Respond with the separated lists
     res.json({
         groomingAppointments,
         treatmentAppointments
     });
});
