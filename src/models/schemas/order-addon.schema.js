const { Schema } = require("mongoose");

const OrderAddOnSchema = new Schema({
    addOnId: { 
        type: Schema.Types.ObjectId, 
        ref: 'AddOn',
        required: [true, 'Add-on ID reference is required'] 
    },
    name: { 
        type: String, 
        required: [true, 'Add-on name is required'],
        trim: true
    },
    priceAtBooking: { 
        type: Number, 
        required: [true, 'Unit price at booking is required'],
        min: [0, 'Price cannot be negative']
    },
    quantity: { 
        type: Number, 
        default: 1,
        min: [1, 'Minimum quantity is 1'],
        validate: {
            validator: Number.isInteger,
            message: 'Quantity must be an integer'
        }
    },
    totalAddOn: { 
        type: Number, 
        required: [true, 'Total add-on amount is required'],
        min: [0, 'Total amount cannot be negative']
    }
}, { 
    _id: false 
});

module.exports = OrderAddOnSchema;