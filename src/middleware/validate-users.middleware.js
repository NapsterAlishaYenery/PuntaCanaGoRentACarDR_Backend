const { Types } = require("mongoose");

const validateUsers = {

    register: (req, res, next) => {
        // Adaptado al nuevo modelo: name, email, password, phone
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: 'Faltan campos obligatorios (name, email, password, phone)'
            });
        }

        // Validación básica de formato de email para no llegar a la DB si está mal
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: 'El formato del email no es válido'
            });
        }

        next();
    },

    login: (req, res, next) => {
        // Ahora usamos email en lugar de username
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                ok: false,
                type: 'AuthError',
                message: "Email y contraseña son requeridos"
            });
        }
        next();
    },

    update: (req, res, next) => {
        const update = req.body;
        const camposRecibidos = Object.keys(update);

        // Campos que NO se pueden tocar mediante el update común de perfil
        const camposProhibidos = ['email', 'password', 'role', '_id', 'createdAt', 'updatedAt'];

        if (camposRecibidos.length === 0) {
            return res.status(400).json({
                ok: false,
                type: 'EmptyRequest',
                message: "No se proporcionaron campos para actualizar"
            });
        }

        for (const campo of camposRecibidos) {
            if (camposProhibidos.includes(campo)) {
                return res.status(400).json({
                    ok: false,
                    type: 'ForbiddenField',
                    message: `El campo '${campo}' está protegido y no puede ser actualizado por esta vía.`
                });
            }
        }
        next();
    },

    id: (req, res, next) => {
        const { id } = req.params;
        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                ok: false,
                type: 'InvalidID',
                message: "El formato del ID es inválido"
            });
        }
        next();
    }
}

module.exports = validateUsers;