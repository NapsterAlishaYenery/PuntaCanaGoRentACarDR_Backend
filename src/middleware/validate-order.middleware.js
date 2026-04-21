const { Types } = require("mongoose");

const validateOrder = {
    // ==========================================
    // VALIDACIÓN PARA CREAR ORDEN
    // ==========================================
    create: (req, res, next) => {
        const { car, pickup, return: dropoff, customer, addOns } = req.body;

        // 1. Validar Vehículo
        if (!car || !car.carId || !Types.ObjectId.isValid(car.carId)) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: "A valid carId is required to create an order."
            });
        }

        // 2. Validar Fechas y Ubicaciones
        if (!pickup || !pickup.date || !pickup.location || !dropoff || !dropoff.date || !dropoff.location) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: "Pickup and Return details (date and location) are required."
            });
        }

        // 3. Validar que la fecha de retorno sea al menos 3 días después de la de recogida
        const pickupDate = new Date(pickup.date);
        const dropoffDate = new Date(dropoff.date);

        // Calculamos la diferencia en milisegundos
        const diffInMs = dropoffDate - pickupDate;
        // Convertimos milisegundos a días (1000ms * 60s * 60min * 24h)
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        if (diffInDays < 3) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: "The minimum rental period is 3 days. Please adjust your return date."
            });
        }

        // 4. Validar Datos del Cliente Obligatorios
        if (!customer || !customer.firstName || !customer.lastName || !customer.email || !customer.phone) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: "Customer details (First Name, Last Name, Email, and Phone) are required."
            });
        }

        // 5. Validar estructura de Add-ons (si existen)
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

    // ==========================================
    // VALIDACIÓN PARA ACTUALIZAR ORDEN
    // ==========================================
    update: (req, res, next) => {
        const updates = req.body;

        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: 'No fields were provided for updating.'
            });
        }

        // 1. Definimos los campos permitidos
        const camposPermitidos = [
            "status", "paymentStatus", "paymentMethod",
            "customer.phone", "customer.email", "customer.address",
            "customer.firstName", "customer.lastName"
        ];

        const finalUpdate = {};

        // 2. NORMALIZACIÓN: Transformamos el body a "Dot Notation"
        // Esto maneja tanto { "customer": { "phone": "..." } } 
        // como { "customer.phone": "..." }
        Object.keys(updates).forEach(key => {
            if (key === 'customer' && typeof updates.customer === 'object') {
                // Si viene como objeto, lo desarmamos
                Object.keys(updates.customer).forEach(subKey => {
                    finalUpdate[`customer.${subKey}`] = updates.customer[subKey];
                });
            } else {
                // Si viene plano (status, paymentStatus, etc.)
                finalUpdate[key] = updates[key];
            }
        });

        // 3. VALIDACIÓN DE SEGURIDAD: ¿Lo que quedó es permitido?
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

        // 4. SOBREESCRIBIMOS el body con el objeto ya normalizado
        req.body = finalUpdate;
        next();
    },

    // ==========================================
    // VALIDACIÓN DE ID DE ORDEN
    // ==========================================
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