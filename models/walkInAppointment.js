const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const walkInAppointmentSchema = new Schema({
    clientName: { type: String, required: true },
    petName: { type: String, required: true },
    petType: { type: String },
    date: { type: Date, default: Date.now },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    service_type: { type: String, enum: ["grooming", "treatment"] },
    services: [{ type: Schema.Types.ObjectId, ref: 'Treatment' }],
    notes: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'declined', 'inProgress', 'finished', 'cancelled', 'postponed', 'reschedule'] },
    queuePosition: { type: Number, default: null },
    estimatedEndTime: { type: Date, default: null },
    arrivalTime: { type: Date, default: Date.now },
    communicationLog: [{ message: String, timestamp: Date, sender: String }],
    isWalkIn: { type: Boolean, default: true }
}, {
    timestamps: true 
});

module.exports = mongoose.model("User", SignupSchema);