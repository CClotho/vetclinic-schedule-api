const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const treatmentSchema = new Schema({
    name: { type: String, required: true },  // e.g., "Full Grooming", "Partial Grooming"
    price: { type: Number },
    description: { type: String },
    
});


module.exports = mongoose.model('treatment', treatmentSchema);