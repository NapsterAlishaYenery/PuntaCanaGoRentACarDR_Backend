const { Schema } = require("mongoose");

const OrderAddOnSchema = new Schema({
    addOnId: { 
        // Reference to the original AddOn catalog ID
        type: Schema.Types.ObjectId, 
        ref: 'AddOn',
        required: [true, 'Add-on ID reference is required'] 
    },
    name: { 
        // Snapshot of the name at the time of booking
        type: String, 
        required: [true, 'Add-on name is required'],
        trim: true
    },
    priceAtBooking: { 
        // Daily unit price saved at the moment of the order
        type: Number, 
        required: [true, 'Unit price at booking is required'],
        min: [0, 'Price cannot be negative']
    },
    quantity: { 
        // How many units the customer requested
        type: Number, 
        default: 1,
        min: [1, 'Minimum quantity is 1'],
        validate: {
            validator: Number.isInteger,
            message: 'Quantity must be an integer'
        }
    },
    totalAddOn: { 
        // Final calculated cost for this specific extra:
        // (priceAtBooking * quantity) OR (priceAtBooking * quantity * days)
        type: Number, 
        required: [true, 'Total add-on amount is required'],
        min: [0, 'Total amount cannot be negative']
    }
}, { 
    _id: false // We don't need a unique ID for each line item in the array
});

module.exports = OrderAddOnSchema;