const { Schema } = require("mongoose");

// Standard Regex for email validation
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const CustomerSchema = new Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: [2, 'First name is too short'],
        maxlength: [50, 'First name is too long']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        minlength: [2, 'Last name is too short'],
        maxlength: [50, 'Last name is too long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [emailRegex, 'Please provide a valid email address']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        minlength: [7, 'Phone number is too short']
    },
    license: {
        type: String,
        trim: true,
        default: '',
        // Optional: Driver's license number
    },
    flightNumber: {
        type: String,
        trim: true,
        default: '',
        uppercase: true // Standardize flight numbers (e.g., AA123)
    },
    country: {
        type: String,
        trim: true,
        default: 'Dominican Republic'
    },
    state: {
        type: String,
        trim: true,
        default: '' // Can be used for province or state
    },
    address: {
        type: String,
        trim: true,
        default: ''
    }
}, { 
    _id: false // We don't need a separate ID for the customer object within the order
});

module.exports = CustomerSchema;