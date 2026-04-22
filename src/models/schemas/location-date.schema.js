const { Schema } = require("mongoose");

const LocationDateSchema = new Schema({
    location: { 
        type: String, 
        required: [true, 'Location is required'],
        trim: true,
        minlength: [3, 'Location name is too short']
    },
    date: { 
        type: Date, 
        required: [true, 'Date and time are required'] 
    }
}, { 
    _id: false
});

module.exports = LocationDateSchema;