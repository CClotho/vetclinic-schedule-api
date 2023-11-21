const Appointment = require("../../models/appointment");
const Pet = require("../../models/pet");
const Treatment = require("../../models/treatment");
const Grooming = require("../../models/grooming");
const asyncHandler = require('express-async-handler');
const io = require('../../bin/www');
const PetSize = require("../../models/petSize")

const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;


exports.delete_queue_appointment = asyncHandler(async (req, res) => {
    const { id } = req.body; // Get the appointment ID from the request body
    console.log(id)
    try {
        // Find the appointment by ID and delete it
        const deletedAppointment = await Appointment.findByIdAndDelete(id);

        if (!deletedAppointment) {
            // No appointment found with the given ID
            return res.status(404).send({ message: 'Appointment not found' });
        }

        // Successfully deleted the appointment
        res.send({ message: 'Appointment deleted successfully', deletedAppointment });
    } catch (error) {
        // Handle any errors that occur during the deletion process
        res.status(500).send({ message: 'Server error', error: error.message });
    }
});
exports.appointment_form_update = asyncHandler(async (req, res) => {
    try {
        const { id, client, pet, date, doctor, service_type, services, status } = req.body;
        
        // Check if the appointment exists
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            res.status(404).send({ message: 'Appointment not found' });
            return;
        }

        // Validate and update fields if they are not empty
        if (client) appointment.client = client;
        if (pet) appointment.pet = pet;
        if (date) appointment.date = new Date(date); // Ensure date is properly formatted
        if (doctor) appointment.doctor = doctor;
        if (service_type) appointment.service_type = service_type;
        if (services && Array.isArray(services) && services.length > 0) appointment.services = services;
        if (status) appointment.status = status;

        await appointment.save();
        
        res.send({ message: 'Appointment updated successfully', updatedAppointment: appointment });
    } catch (error) {
        res.status(500).send({ message: 'Server error', error: error.message });
    }
});



exports.appointment_update = asyncHandler(async (req, res) => {
    try {
        const { id, status, arrivalTime, queuePosition, services, resetDuration , duration} = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).send({ message: 'Appointment not found' });
        }

        // Update fields based on provided data
        if (status) appointment.status = status;
        if (arrivalTime) {
            // Convert 'arrivalTime' to a Date object
            const [hours, minutes] = arrivalTime.split(':');
            const date = new Date(appointment.date); // assuming 'date' is the appointment date
            date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
            appointment.arrivalTime = date;
        }
        
        if (queuePosition !== undefined) appointment.queuePosition = queuePosition;
        if (queuePosition === null) appointment.queuePosition = null;
        if (services) appointment.services = services;
        if (appointment.status === "finished" && duration !== undefined) {
            appointment.duration = duration;
        } else if (status === 'started') {
            appointment.startTime = new Date();
        }

       


        await appointment.save();

     
      
        
        res.send({ message: 'Appointment updated successfully', updatedAppointment: appointment });
    } catch (error) {
        res.status(500).send({ message: 'Server error', error: error.message });
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


    // add socketio
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
        $or: [{ status: "approved" }, { status: "started" }, { status: "started" }, { status: "finished" }]
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
