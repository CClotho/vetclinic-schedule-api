const Appointment = require("../../models/appointment");
const asyncHandler = require('express-async-handler');
const io = require('../../bin/www');


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


exports.create_appointment =  asyncHandler(async(req, res) => {
    try {
        // Extract data from the request body
        const { client, pet, date, doctor, service_type, services } = req.body;

        // Create a new appointment instance
        const newAppointment = new Appointment({
            client,
            pet,
            date,
            doctor,
            service_type,
            services,
            //notes,
            //priority,
            //status
        });

        // Save the appointment to the database
        await newAppointment.save();

        // Send a success response
        res.status(201).json({ message: 'Appointment created successfully!', appointment: newAppointment });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
