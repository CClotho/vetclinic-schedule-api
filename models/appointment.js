const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AppointmentServiceSchema = new Schema({
    serviceId: { type: Schema.Types.ObjectId, refPath: 'services.serviceType' },
    serviceType: { type: String, enum: ["grooming", "treatment"] },
    chosenSize: { 
        type: Schema.Types.ObjectId, 
        ref: 'PetSize', // Reference to the PetSize schema
        required: function() { return this.serviceType === 'grooming'; }
    }
});



const Appointment = new Schema({
    
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true},
    pet: { type: Schema.Types.ObjectId, ref: 'Pet', required: true},
    date: {type: Date},
    doctor: {type: Schema.Types.ObjectId, ref: 'Doctor'},
    service_type: {
        type: String,
        enum: ["grooming", "treatment"],
        required: true
    },
    services: [AppointmentServiceSchema],
    notes: {type: String}, // can be use for reschedule
    priority: {type: String, enum:["High", "Low", "Medium"]}, // should I just edit this in front end?
    status: {type: String, enum:['pending', 'approved', 'declined', 'started', 'finished','cancelled', 'noShow', 'reschedule'], default: "pending"},
    queuePosition: { type: Number, default: null, index: true },
    estimatedEndTime: { type: Date, default: null },
    arrivalTime: { type: Date,  default: Date.now , index: true},
    startTime: {type: Number, default: null},
    duration: {type: Number, default: null  },
    deletedAt: {type: Date, default: null},
}, {
    timestamps: true 
})

module.exports = mongoose.model("Appointment", Appointment);