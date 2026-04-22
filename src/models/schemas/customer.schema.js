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
    },
    flightNumber: {
        type: String,
        trim: true,
        default: '',
        uppercase: true 
    },
    country: {
        type: String,
        trim: true,
        default: 'Dominican Republic'
    },
    state: {
        type: String,
        trim: true,
        default: '' 
    },
    address: {
        type: String,
        trim: true,
        default: ''
    }
}, { 
    _id: false
});

module.exports = CustomerSchema;