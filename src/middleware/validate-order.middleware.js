const { Types } = require("mongoose");

const validateOrder = {
    create: (req, res, next) => {
        const { car, pickup, return: dropoff, customer, addOns } = req.body;


        if (!car || !car.carId || !Types.ObjectId.isValid(car.carId)) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: "A valid carId is required to create an order."
            });
        }

        if (!pickup || !pickup.date || !pickup.location || !dropoff || !dropoff.date || !dropoff.location) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: "Pickup and Return details (date and location) are required."
            });
        }

        // Cambia la lógica de validación de días por esta:
        const pickupDate = new Date(pickup.date);
        const dropoffDate = new Date(dropoff.date);

        // Calculamos la diferencia en milisegundos y luego a horas
        const diffInMs = dropoffDate.getTime() - pickupDate.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);

        // 3 días son 72 horas. 
        // Usamos 71.9 para dar un pequeño margen de 6 minutos por retrasos de red
        if (diffInHours < 71.9) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: "The minimum rental period is 3 days (72 hours)."
            });
        }


        if (!customer || !customer.firstName || !customer.lastName || !customer.email || !customer.phone) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: "Customer details (First Name, Last Name, Email, and Phone) are required."
            });
        }

        if (addOns && Array.isArray(addOns)) {
            for (const item of addOns) {
                if (!item.addOnId || !Types.ObjectId.isValid(item.addOnId) || !item.quantity) {
                    return res.status(400).json({
                        ok: false,
                        type: 'ValidationError',
                        message: "Each Add-on must have a valid addOnId and a quantity."
                    });
                }
            }
        }

        next();
    },


    update: (req, res, next) => {
        const updates = req.body;

        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: 'No fields were provided for updating.'
            });
        }


        const camposPermitidos = [
            "status", "paymentStatus", "paymentMethod",
            "customer.phone", "customer.email", "customer.address",
            "customer.firstName", "customer.lastName"
        ];

        const finalUpdate = {};


        Object.keys(updates).forEach(key => {
            if (key === 'customer' && typeof updates.customer === 'object') {
                Object.keys(updates.customer).forEach(subKey => {
                    finalUpdate[`customer.${subKey}`] = updates.customer[subKey];
                });
            } else {
                finalUpdate[key] = updates[key];
            }
        });

        const camposAProcesar = Object.keys(finalUpdate);
        for (const campo of camposAProcesar) {
            if (!camposPermitidos.includes(campo)) {
                return res.status(403).json({
                    ok: false,
                    type: 'SecurityError',
                    message: `The field '${campo}' is protected or invalid.`
                });
            }
        }

        req.body = finalUpdate;
        next();
    },


    id: (req, res, next) => {
        const { id } = req.params;
        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: "Invalid ID format for Order."
            });
        }
        next();
    }
};

module.exports = validateOrder;