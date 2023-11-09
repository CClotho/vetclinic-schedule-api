const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const clientSchema = new Schema({
    
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    age: {type:  Number , required: true },
    phone_number: {type: String},
    email: {type: String, required: true},
    pets: [{type: Schema.Types.ObjectId, ref: "Pet", required: true}],
    
}, { timestamps: true})


module.exports = mongoose.model("Client", clientSchema);