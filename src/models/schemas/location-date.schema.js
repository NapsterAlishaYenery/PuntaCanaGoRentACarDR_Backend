const { Schema } = require("mongoose");

const LocationDateSchema = new Schema({
    location: { 
        // Hotel name, Airport, or specific address for delivery/pickup
        type: String, 
        required: [true, 'Location is required'],
        trim: true,
        minlength: [3, 'Location name is too short']
    },
    date: { 
        // Full date and time for the event
        type: Date, 
        required: [true, 'Date and time are required'] 
    }
}, { 
    _id: false // Nested structure, no separate ID needed
});

module.exports = LocationDateSchema;