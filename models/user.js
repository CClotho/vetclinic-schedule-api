const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const SignupSchema = new Schema({
    
    username: {type: String, required: true},
    password: {type:  String , required: true },
    email: {type: String, required: true},
    role: {type: String, enum:["doctor", "client"], required: true},
    createdAt: {type: Date},
    modifiedAt: {type:Date},

}, {
    timestamps: true 

})


module.exports = mongoose.model("User", SignupSchema);