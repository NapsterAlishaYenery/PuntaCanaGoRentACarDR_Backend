const { Schema, model } = require("mongoose");
const CustomerSchema = require("./schemas/customer.schema");
const OrderAddOnSchema = require("./schemas/order-addon.schema");
const LocationDateSchema = require("./schemas/location-date.schema");
const FinancialsSchema = require("./schemas/financials.schema");

const OrderSchema = new Schema({
    orderNumber: {
        type: String,
        unique: true,
        uppercase: true
    },
   
    car: {
        carId: { type: Schema.Types.ObjectId, ref: 'cars', required: true },
        brand: String, 
        model: String,
        basePricePerDay: Number 
    },

    pickup: LocationDateSchema,
    return: LocationDateSchema,

    days: { 
        type: Number, 
        required: true,
        min: [3, 'El alquiler mínimo es de 3 días'] 
    },

    customer: CustomerSchema,
    addOns: [OrderAddOnSchema],
    financials: FinancialsSchema,

    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'partially_paid', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['pay_later', 'stripe', 'paypal', 'transfer'], 
        default: 'pay_later'
    },
    
    
    paymentDetails: {
        transactionId: { type: String, default: null },
        gatewayResponse: { type: Object, default: null } 
    },

    status: {
        type: String,
        enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'deleted'],
        default: 'pending'
    }
}, {
    versionKey: false,
    timestamps: true
});

module.exports = model("Order", OrderSchema);