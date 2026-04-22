const { Schema, model } = require("mongoose");

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [emailRegex, 'Por favor, proporciona un email válido']
    },
    password: { 
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        select: false 
    },
    phone: {
        type: String,
        required: [true, 'El teléfono es obligatorio'],
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    versionKey: false,
    timestamps: true
});



module.exports = model("User", UserSchema);