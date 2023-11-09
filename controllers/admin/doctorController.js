const Doctor = require('../../models/doctor');
const { validationResult } = require('express-validator');

exports.create_doctor = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { first_name, last_name, age, gender, contact_number } = req.body;

        const newDoctor = new Doctor({
            first_name,
            last_name,
            age,
            gender,
            contact_number
        });

        await newDoctor.save();

        res.status(201).json({ message: 'Doctor added successfully', doctor: newDoctor });
    } catch (error) {
        console.error('Error adding doctor:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
