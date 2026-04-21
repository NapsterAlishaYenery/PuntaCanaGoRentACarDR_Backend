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
    // Referencia y Snapshot del vehículo
    car: {
        carId: { type: Schema.Types.ObjectId, ref: 'cars', required: true },
        brand: String, 
        model: String,
        basePricePerDay: Number // Guardamos el precio del momento
    },
    
    // Usamos el mismo schema para ambos
    pickup: LocationDateSchema,
    return: LocationDateSchema,

    days: { 
        type: Number, 
        required: true,
        min: [3, 'El alquiler mínimo es de 3 días'] // Tu restricción de 3 días
    },

    customer: CustomerSchema,
    addOns: [OrderAddOnSchema],
    financials: FinancialsSchema,

    // Gestión de Pagos
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
    
    // Campo para guardar IDs de transacciones de Stripe/PayPal en el futuro
    paymentDetails: {
        transactionId: { type: String, default: null },
        gatewayResponse: { type: Object, default: null } // Aquí caerá todo lo de Stripe después
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