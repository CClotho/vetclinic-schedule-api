const mongoose = require("mongoose");
const Schema = mongoose.Schema;


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
    services: [{
        type: Schema.Types.ObjectId,
        refPath: 'service_type'  // This will use the value of service_type as the collection to reference
    }],
    notes: {type: String}, // can be use for reschedule
    priority: {type: String, enum:["High", "Low", "Medium"]}, // should I just edit this in front end?
    status: {type: String, enum:['pending', 'approved', 'declined', 'inProgress', 'finished','cancelled', 'noShow', 'reschedule']},
    queuePosition: { type: Number, default: null },
    estimatedEndTime: { type: Date, default: null },
    arrivalTime: { type: Date,  default: Date.now },
    startTime: {type: Number, default: null},
    duration: {type: Number, default: null  },
    deletedAt: {type: Date, default: null},
}, {
    timestamps: true 
})

module.exports = mongoose.model("Appointment", Appointment);