const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const petSizeSchema = new Schema({
    size: { type: String, required: true }, // e.g., "small", "medium", "large"
    description: { type: String }, // e.g., "A big fur"
    price: { type: Number }
});

module.exports = mongoose.model('PetSize', petSizeSchema);
