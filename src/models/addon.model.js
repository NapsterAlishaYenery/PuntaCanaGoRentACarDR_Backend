const { Schema, model } = require("mongoose");

const AddOnSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre del extra es obligatorio'],
        trim: true,
        unique: true,
        minLength: [3, 'El nombre debe tener al menos 3 caracteres'],
        maxLength: [50, 'El nombre es demasiado largo']
    },
    description: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        trim: true,
        minLength: [10, 'La descripción debe ser más detallada (min. 10 caracteres)']
    },
    price: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo'],
        validate: {
            validator: (v) => v <= 500,
            message: 'El precio ({VALUE}) parece demasiado alto para un extra.'
        }
    },
    icon: {
        type: String,
        default: 'pi pi-plus-circle',
        trim: true
    },
    isPerDay: {
        type: Boolean,
        default: true
    },
    maxQuantity: {
        type: Number,
        default: 1,
        validate: {
            validator: Number.isInteger,
            message: 'La cantidad máxima debe ser un número entero.'
        },
        min: [1, 'La cantidad máxima permitida debe ser al menos 1']
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    versionKey: false,
    timestamps: true
});

AddOnSchema.pre('save', function() {
    if (this.name) {
        this.name = this.name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
});

module.exports = model("AddOn", AddOnSchema);