const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const treatmentSchema = new Schema({
    name: { type: String, required: true },  // e.g., "Full Grooming", "Partial Grooming"
    price: { type: Number },
    description: { type: String },
    availability: {type: Boolean}
    
});


module.exports = mongoose.model('treatment', treatmentSchema);