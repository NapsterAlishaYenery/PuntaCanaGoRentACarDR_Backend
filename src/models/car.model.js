const { Schema, model } = require('mongoose');
const slugify = require('slugify');

const priceValidator = require('../utils/price.validator');

const CarSchema = new Schema({
    brand: {
        type: String,
        required: [true, 'La marca del vehículo es obligatoria'],
        trim: true,
        uppercase: true 
    },
    model: {
        type: String,
        required: [true, 'El modelo del vehículo es obligatorio'],
        trim: true,
        uppercase: true
    },
    category: {
        type: [String],
        required: [true, 'Al menos una categoría es requerida'],
        validate: {
            validator: function (v) { return v && v.length > 0; },
            message: 'El carro debe tener al menos una categoría'
        }
    },
    seats: {
        type: Number,
        required: [true, 'Cantidad de asientos es requerida'],
        min: [1, 'Debe tener al menos 1 asiento']
    },
    bags: {
        type: Number,
        required: [true, 'Capacidad de equipaje es requerida'],
        min: [0, 'El número de maletas no puede ser negativo']
    },
    doors: {
        type: Number,
        required: [true, 'Cantidad de puertas es requerida'],
        min: [2, 'Debe tener al menos 2 puertas']
    },
    transmission: {
        type: String,
        required: [true, 'Tipo de transmisión es obligatorio'],
        lowercase: true,
        enum: {
            values: ['automatic', 'manual'],
            message: '{VALUE} no es una transmisión válida'
        }
    },
    fuel: {
        type: String,
        required: [true, 'Tipo de combustible es obligatorio'],
        lowercase: true,
        enum: {
            values: ['petrol', 'diesel', 'electric', 'hybrid'],
            message: '{VALUE} no es un combustible válido'
        }
    },
    usDayPrice: { 
        type: Number,
        required: [true, 'El precio por día en USD es obligatorio'],
        min: [1, 'El precio debe ser mayor a 0'],
        validate: priceValidator 
    },
    description: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        trim: true,
        minLength: [20, 'La descripción debe tener al menos 20 caracteres']
    },
    imageurl: {
        type: String,
        required: [true, 'La URL de la imagen es obligatoria']
    },
    features: {
        airConditioning: { type: Boolean, default: true },
        childSeat: { type: Boolean, default: false },
        gps: { type: Boolean, default: false },
        luggage: { type: Boolean, default: true },
        music: { type: Boolean, default: true },
        seatBelt: { type: Boolean, default: true },
        sleepingBed: { type: Boolean, default: false },
        water: { type: Boolean, default: false },
        bluetooth: { type: Boolean, default: true },
        onboardComputer: { type: Boolean, default: false },
        audioInput: { type: Boolean, default: true },
        longTermTrips: { type: Boolean, default: true },
        carKit: { type: Boolean, default: true },
        remoteCentralLocking: { type: Boolean, default: true },
        climateControl: { type: Boolean, default: true }
    },
    isAvailable: {
        type: Boolean,
        default: true,

    },
    deposit: {
        type: Number,
        min: [1, 'El deposito debe ser mayor a 0'],
        default: 100,
        validate: priceValidator 

    },
    slug: {
        type: String,
        required: [true, 'El slug es obligatorio para SEO'],
        unique: true,
        lowercase: true,
        trim: true
    }
}, {
    versionKey: false,
    timestamps: true
});

CarSchema.pre('validate', function () {
    if (this.isNew && this.brand && this.model && !this.slug) {
        const base = `${this.brand} ${this.model}`;
        const baseSlug = slugify(base, { lower: true, strict: true });

        const date = new Date();
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        const randomStr = Math.random().toString(36).substring(2, 7);

       
        this.slug = `${baseSlug}-${dateString}-${randomStr}`;
    }

    if (this.category && Array.isArray(this.category)) {
        this.category = this.category.map(c => c.toLowerCase());
    }

});


module.exports = model("cars", CarSchema);