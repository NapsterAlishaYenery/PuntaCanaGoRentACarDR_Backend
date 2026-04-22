const { Types } = require("mongoose");

const CAMPOS_PERMITIDOS = [
    "brand",
    "model",
    "category",
    "seats",
    "bags",
    "doors",
    "transmission",
    "fuel",
    "usDayPrice",
    "description",
    "imageurl",
    "features",
    "deposit"
];

const validateCars = {

    create: (req, res, next) => {

        const data = req.body;
        
        if (data.slug) {
            return res.status(400).json({
                ok: false,
                type: 'SecurityError',
                message: "The field 'slug' cannot be sent manually. The system generates it automatically."
            });
        }

        const camposObligatorios = [
            "brand",
            "model",
            "category",
            "seats",
            "bags",
            "doors",
            "transmission",
            "fuel",
            "usDayPrice",
            "description",
            "imageurl",
        ];

        for (const campo of camposObligatorios) {

            if (data[campo] === undefined || data[campo] === null || data[campo] === "") {
                return res.status(400).json({
                    ok: false,
                    type: 'ValidationError',
                    message: `The field '${campo}' is required.`
                });
            }
        }

        if (!Array.isArray(data.category)) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: "The field 'category' must be an array."
            });
        }

        if (data.features && (typeof data.features !== 'object' || Array.isArray(data.features))) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: "The field 'features' must be a valid object."
            });
        }

        next();
    },


    update: (req, res, next) => {

        const updates = req.body;
        const camposRecibidos = Object.keys(updates);

        const camposProhibidos = ["_id", "slug", "createdAt", "updatedAt"];

        if (camposRecibidos.length === 0) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: 'No fields were provided for updating.'
            });
        }


        for (const campo of camposRecibidos) {

            if (camposProhibidos.includes(campo)) {
                return res.status(400).json({
                    ok: false,
                    type: 'ValidationError',
                    message: `You cannot update the field '${campo}'. It is a protected field.`
                });
            }

            if (!CAMPOS_PERMITIDOS.includes(campo)) {
                return res.status(400).json({
                    ok: false,
                    type: 'ValidationError',
                    error: `The field '${campo}' It is not valid for updating..`
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
                message: "Invalid ID format"
            });
        }

        next();
    }
}

module.exports = validateCars;