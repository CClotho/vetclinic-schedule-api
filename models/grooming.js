const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const groomingSchema = new Schema({
    name: { type: String, required: true },  // e.g., "Full Grooming", "Partial Grooming"
    sizes: [{type: Schema.Types.ObjectId, ref: 'PetSize' }] , // Reference to PetSize
    price: { type: Number },
    description: { type: String },
    availability: {type: Boolean}
});

module.exports = mongoose.model('grooming', groomingSchema);