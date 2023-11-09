const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sizeDetailSchema = new Schema({
    size: { type: String, enum: ['small', 'medium', 'large', 'extra-large', 'none'] },
    price: { type: Number, required: true },
    details: { type: String }
});


const groomingSchema = new Schema({
    name: { type: String, required: true },  // e.g., "Full Grooming", "Partial Grooming"
    sizes: [sizeDetailSchema],
    description: { type: String },
    
});

module.exports = mongoose.model('Grooming', groomingSchema);