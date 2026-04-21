const { Types } = require("mongoose");

const CAMPOS_PERMITIDOS = [
    "name",
    "description",
    "price",
    "icon",
    "isPerDay",
    "maxQuantity",
    "active"
];

const validateAddOns = {

    create: (req, res, next) => {
        const data = req.body;

        const camposObligatorios = [
            "name",
            "description",
            "price"
        ];

        // 1. Validar presencia de campos obligatorios
        for (const campo of camposObligatorios) {
            if (data[campo] === undefined || data[campo] === null || data[campo] === "") {
                return res.status(400).json({
                    ok: false,
                    type: 'ValidationError',
                    message: `The field '${campo}' is required.`
                });
            }
        }

        // 2. Validaciones de tipo específicas
        if (typeof data.price !== 'number' || data.price < 0) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: "The field 'price' must be a positive number."
            });
        }

        if (data.maxQuantity !== undefined && (!Number.isInteger(data.maxQuantity) || data.maxQuantity < 1)) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: "The field 'maxQuantity' must be an integer greater than 0."
            });
        }

        next();
    },

    update: (req, res, next) => {
        const updates = req.body;
        const camposRecibidos = Object.keys(updates);
        const camposProhibidos = ["_id", "createdAt", "updatedAt"];

        if (camposRecibidos.length === 0) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: 'No fields were provided for updating.'
            });
        }

        for (const campo of camposRecibidos) {
            // No permitir modificar campos del sistema
            if (camposProhibidos.includes(campo)) {
                return res.status(400).json({
                    ok: false,
                    type: 'ValidationError',
                    message: `You cannot update the field '${campo}'. It is a protected field.`
                });
            }

            // Validar que el campo exista en el esquema permitido
            if (!CAMPOS_PERMITIDOS.includes(campo)) {
                return res.status(400).json({
                    ok: false,
                    type: 'ValidationError',
                    message: `The field '${campo}' is not valid for updating.`
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
                type: 'ValidationError',
                message: "Invalid ID format for AddOn."
            });
        }

        next();
    }
};

module.exports = validateAddOns;