const { Types } = require("mongoose");

const validateUsers = {

    register: (req, res, next) => {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: 'Missing required fields (name, email, password, phone)'
            });
        }

        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: 'Invalid email format'
            });
        }

        next();
    },

    login: (req, res, next) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                ok: false,
                type: 'AuthError',
                message: "Email and password are required"
            });
        }
        next();
    },

    update: (req, res, next) => {
        const update = req.body;
        const camposRecibidos = Object.keys(update);

        const camposProhibidos = ['email', 'password', 'role', '_id', 'createdAt', 'updatedAt'];

        if (camposRecibidos.length === 0) {
            return res.status(400).json({
                ok: false,
                type: 'EmptyRequest',
                message: "No fields were provided for update"
            });
        }

        for (const campo of camposRecibidos) {
            if (camposProhibidos.includes(campo)) {
                return res.status(400).json({
                    ok: false,
                    type: 'ForbiddenField',
                    message: `The field '${campo}' is protected and cannot be updated through this route.`
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
                message: "Invalid ID format"
            });
        }
        next();
    }
}

module.exports = validateUsers;