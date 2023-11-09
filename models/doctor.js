const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const doctorSchema = new Schema({
    
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    age: {type: Number},
    gender: {type: String, enum: ["Female", "Male"], required: true},
    contact_number: {type: String}, 
}, {timestamps: true })



module.exports = mongoose.model("Doctor", doctorSchema);