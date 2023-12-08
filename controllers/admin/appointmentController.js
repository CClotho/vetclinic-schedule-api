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
         console.log(" This is the request body", req.body);
         const { id, data: { client, pet, date, service_type, services, status, size } } = req.body;

        
        // Check if the appointment exists
        const appointment = await Appointment.findByIdAndUpdate(id);
        if (!appointment) {
            res.status(404).send({ message: 'Appointment not found' });
            return;
        }

        // Validate and update fields if they are not empty
        if (client !== "undefined") appointment.client = client;
        if(size !== "undefined" && service_type === 'grooming') {
            appointment.size = size;
        } 
        else {
            appointment.size = null;
        }
        if (pet !== 'undefined') appointment.pet = pet;
        if (date !== "undefined") appointment.date = new Date(date); // Ensure date is properly formatted
        if (service_type !== "undefined") appointment.service_type = service_type;
        if (services && Array.isArray(services) && services.length > 0) appointment.services = services;
        if (status !== "undefined") appointment.status = status;

       
            // ... existing code ...
            await appointment.save();
        console.log('Saved appointment:', appointment); // Log the saved appointment
        res.send({ message: 'Appointment updated successfully', data: appointment, id: appointment._id });
    } catch (error) {
        console.error('Error saving appointment:', error); // Log any error
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
        }else if(status === 'paused') {
            // Calculate and update duration up to the pause point, if the appointment had started
            if (appointment.startTime) {
                const now = new Date();
                const elapsed = (now - appointment.startTime) / 1000; // duration in seconds
                appointment.duration += elapsed; // add elapsed time to total duration
                appointment.pausedDuration = appointment.duration; // store the total duration up to pause
            }
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
        const { client, pet, date,  service_type, services,  status, size } = req.body;
        


    
        const newAppointment = new Appointment({
            client: client,
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
        res.status(201).json({ message: 'Appointment created successfully!', appointment: newAppointment });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ message: 'Server error' });
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
        $or: [{ status: "approved" }, { status: "started" }, { status: "started" }, { status: "finished" }, { status: "paused" },]
    })
    .populate([
        { path: 'client', select: 'first_name last_name' }, 
        { path: 'pet', select: 'pet_name' }, 
        { path: 'doctor', select: 'first_name' },
        { path: 'services' },
        { path: 'size' }, 
    ])
    .lean();

    



     // Separating grooming and treatment appointments
     const groomingAppointments = appointments.filter(appointment => appointment.service_type === 'grooming');
     const treatmentAppointments = appointments.filter(appointment => appointment.service_type === 'treatment');
 
     // Respond with the separated lists
     res.json({
         groomingAppointments,
         treatmentAppointments
     });
});

exports.appointments_finished_list = asyncHandler(async (req, res) => {
    


    const appointments = await Appointment.find({  
        $or: [{ status: "noShow" }, { status: "finished" }, { status: "cancelled" }, { status: "reschedule" }, { status: "pending" }, { status: "approved" }]
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
});