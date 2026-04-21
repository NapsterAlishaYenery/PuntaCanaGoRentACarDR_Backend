const Order = require('../models/order.model');
const Car = require('../models/car.model');
const AddOn = require('../models/addon.model');

// Helper: Genera PCGRCDR-20260420-A1B2
const generateOrderNumber = () => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PCGRCDR-${date}-${random}`;
};

exports.createOrder = async (req, res) => {
    try {
        const { car, pickup, return: dropoff, customer, addOns: addOnsRequest, paymentMethod } = req.body;

        // 1. Variables de cálculo
        let rentalSubtotal = 0;
        let addOnsTotal = 0;
        const taxPercentage = 0.18;

        // 2. Buscar Carro y calcular días reales
        const carDb = await Car.findById(car.carId);
        if (!carDb) {
            return res.status(404).json({ ok: false, type: 'NotFoundError', message: 'Car not found' });
        }

        const pickupDate = new Date(pickup.date);
        const dropoffDate = new Date(dropoff.date);
        // Math.ceil asegura que si se pasan por 1 hora, se cobra el día completo
        const diffInDays = Math.ceil((dropoffDate - pickupDate) / (1000 * 60 * 60 * 24));
        
        rentalSubtotal = carDb.usDayPrice * diffInDays;

        // 3. Procesar Add-ons desde la DB (Seguridad total)
        const detailedAddOns = [];
        if (Array.isArray(addOnsRequest)) {
            for (const item of addOnsRequest) {
                const addOnDb = await AddOn.findById(item.addOnId);
                
                if (addOnDb && addOnDb.active) {
                    const units = parseInt(item.quantity) || 1;
                    
                    // Lógica solicitada: Cantidad * Precio * Días (si es por día)
                    const totalItem = addOnDb.isPerDay 
                        ? (addOnDb.price * units * diffInDays)
                        : (addOnDb.price * units);
                    
                    addOnsTotal += totalItem;

                    detailedAddOns.push({
                        addOnId: addOnDb._id,
                        name: addOnDb.name,
                        priceAtBooking: addOnDb.price,
                        quantity: units,
                        totalAddOn: Number(totalItem.toFixed(2))
                    });
                }
            }
        }

        // 4. Cálculos Finales con redondeo a 2 decimales
        const subtotalGeneral = Number((rentalSubtotal + addOnsTotal).toFixed(2));
        const taxAmount = Number((subtotalGeneral * taxPercentage).toFixed(2));
        const totalFinal = Number((subtotalGeneral + taxAmount).toFixed(2));

        // 5. Creación del documento
        const newOrder = new Order({
            orderNumber: generateOrderNumber(),
            car: {
                carId: carDb._id,
                brand: carDb.brand,
                model: carDb.model,
                basePricePerDay: carDb.usDayPrice
            },
            pickup,
            return: dropoff,
            days: diffInDays,
            customer,
            addOns: detailedAddOns,
            financials: {
                rentalSubtotal,
                addOnsTotal,
                subtotalGeneral,
                taxPercentage,
                taxAmount,
                totalFinal
            },
            paymentMethod: paymentMethod || 'pay_later',
            status: 'pending'
        });

        await newOrder.save();

        res.status(201).json({
            ok: true,
            data: newOrder,
            message: 'Reservation created successfully'
        });

    } catch (error) {
        console.error('ORDER_CREATE_ERROR:', error);
        res.status(500).json({ 
            ok: false, 
            type: 'ServerError', 
            message: 'An error occurred while processing the reservation' 
        });
    }
};

exports.updateOrder = async (req, res) => {
    const { id } = req.params;
    // req.body ya viene como { "customer.phone": "...", "status": "..." } gracias al middleware
    const updateData = req.body;

    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { $set: updateData },
            { 
                returnDocument: 'after', 
                runValidators: true 
            }
        );

        if (!updatedOrder) {
            return res.status(404).json({ ok: false, message: 'Order not found.' });
        }

        res.status(200).json({
            ok: true,
            data: updatedOrder,
            message: 'Order updated successfully'
        });

    } catch (error) {
        console.error('ORDER_UPDATE_ERROR:', error);
        res.status(500).json({ ok: false, message: 'Error updating order.' });
    }
};

exports.deleteOrder = async (req, res) => {
    const { id } = req.params;

    try {
        // En lugar de findByIdAndDelete, usamos update para cambiar el estado
        // He añadido un estado 'cancelled' que es el estándar para esto
        const cancelledOrder = await Order.findByIdAndUpdate(
            id,
            { status: 'cancelled' }, 
            { new: true }
        );

        if (!cancelledOrder) {
            return res.status(404).json({
                ok: false,
                type: 'NotFoundError',
                message: 'Error: Could not find the order to cancel.'
            });
        }

        res.status(200).json({
            ok: true,
            message: 'Order status changed to cancelled successfully.',
            data: cancelledOrder
        });

    } catch (error) {
        console.error('ORDER_DELETE_ERROR:', error);
        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'An error occurred during the cancellation process.'
        });
    }
};

exports.getOrderById = async (req, res) => {
    const { id } = req.params;

    try {
        // Buscamos la orden por ID
        // Nota: No es necesario usar .populate() porque ya guardamos 
        // los datos del carro y los extras como un "snapshot" dentro de la orden.
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                ok: false,
                type: 'NotFoundError',
                message: 'Error: The reservation does not exist.'
            });
        }

        res.status(200).json({
            ok: true,
            data: order
        });

    } catch (error) {
        console.error('ORDER_GET_BY_ID_ERROR:', error);
        
        // Si el error es por un ID mal formado de MongoDB
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                ok: false,
                message: 'Invalid Order ID format.'
            });
        }

        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'An error occurred while retrieving the order.'
        });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        // 1. Extraer filtros y paginación
        const { 
            page = 1, 
            limit = 10, 
            orderNumber, 
            status, 
            paymentStatus, 
            customerName, 
            email, 
            carId,
            startDate, // Para contabilidad: desde qué fecha
            endDate    // Para contabilidad: hasta qué fecha
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        let query = {};

        // --- FILTROS DE BÚSQUEDA ---

        // Búsqueda por número de orden (Exacto o Parcial)
        if (orderNumber) {
            query.orderNumber = { $regex: orderNumber, $options: 'i' };
        }

        // Búsqueda por Status (Enum exacto)
        if (status) {
            query.status = status;
        }

        // Búsqueda por Estado de Pago
        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }

        // Búsqueda por Email del cliente
        if (email) {
            query['customer.email'] = { $regex: email, $options: 'i' };
        }

        // Búsqueda por Nombre o Apellido
        if (customerName) {
            query.$or = [
                { 'customer.firstName': { $regex: customerName, $options: 'i' } },
                { 'customer.lastName': { $regex: customerName, $options: 'i' } }
            ];
        }

        // Filtro por Vehículo específico
        if (carId) {
            query['car.carId'] = carId;
        }

        // Filtro por Rango de Fechas (Contabilidad)
        // Busca órdenes creadas entre startDate y endDate
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) {
                // Ajustamos el endDate al final del día (23:59:59)
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        // 2. Ejecución en paralelo para máximo rendimiento
        const [orders, totalItems] = await Promise.all([
            Order.find(query)
                .sort({ createdAt: -1 }) // Las más recientes primero
                .skip(skip)
                .limit(parseInt(limit)),
            Order.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        // 3. Respuesta estandarizada para el Front-end
        return res.status(200).json({
            ok: true,
            data: orders,
            message: totalItems > 0 ? 'Orders retrieved successfully.' : 'No orders found with these criteria.',
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('GET_ALL_ORDERS_ERROR:', error);
        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'A critical error occurred while fetching orders.',
        });
    }
};