const mongoose = require('mongoose');
const Schema = mongoose.Schema; // so you dont have to use it like moongoose.Schema

const PetSchema = new Schema({
 
   pet_name: {type: String,  required: true},
   type: {type: String, required:true, enum: ['dog', 'cat', 'rabbit', 'bird', 'parrot', 'hamster']},
   breed: {type: String, required: true},
   gender: { type: String, enum:["Male", "Female"], required: true},
   owner: {type: Schema.Types.ObjectId, ref: 'Owner', required: true},
   pet_photo: {
      data: Buffer,
      contentType: String,
    }
    
}, {
   timestamps: true 
})

module.exports = mongoose.model('Pet', PetSchema);


// creating pet  POST create/pet
// POST update/pet:id/photo on client's side  for picture only
