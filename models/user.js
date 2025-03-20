const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email : {
        type : String,
        required : true
    }
    //username and pw will be defined by passport-locAL-mongoose automatically
})

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User" , userSchema);
module.exports = User;
