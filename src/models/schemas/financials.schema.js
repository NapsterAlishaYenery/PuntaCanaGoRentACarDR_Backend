const { Schema } = require("mongoose"); // <--- ¡Faltaba esta línea!

const FinancialsSchema = new Schema({
    rentalSubtotal: { 
        // Daily rate of the car multiplied by the number of rental days
        type: Number, 
        required: [true, 'Rental subtotal is required'],
        min: [0, 'Amount cannot be negative'],
        default: 0
    }, 
    addOnsTotal: {  
        // Total sum of all selected extras/add-ons
        type: Number, 
        required: [true, 'Add-ons total is required'],
        min: [0, 'Amount cannot be negative'],
        default: 0
    },   
    subtotalGeneral: { 
        // Sum of rentalSubtotal + addOnsTotal (before taxes)
        type: Number, 
        required: [true, 'General subtotal is required'],
        min: [0, 'Amount cannot be negative'],
        default: 0
    }, 
    taxPercentage: { 
        // Tax rate (e.g., 0.18 for 18% ITBIS in Dominican Republic)
        type: Number, 
        default: 0.18,
        min: [0, 'Tax percentage cannot be negative']
    },
    taxAmount: {  
        // Calculated tax: subtotalGeneral * taxPercentage
        type: Number, 
        required: [true, 'Tax amount is required'],
        min: [0, 'Amount cannot be negative'],
        default: 0
    },     
    totalFinal: {  
        // Final amount to be paid: subtotalGeneral + taxAmount
        type: Number, 
        required: [true, 'Final total is required'],
        min: [0, 'Amount cannot be negative'],
        default: 0
    }     
}, { 
    _id: false // Nested object within the order, no separate ID needed
});

module.exports = FinancialsSchema;