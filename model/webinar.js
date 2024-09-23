const mongoose = require('mongoose');

const webinarSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    purposeOfBooking:{
        type:String,
        required:true
    },
});

const Webinar = mongoose.model('Webinar', webinarSchema);
module.exports = Webinar;