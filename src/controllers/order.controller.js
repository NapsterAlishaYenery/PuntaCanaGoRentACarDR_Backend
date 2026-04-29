const Order = require('../models/order.model');
const Car = require('../models/car.model');
const AddOn = require('../models/addon.model');
const LOCATIONS = require('../utils/locations');

const generateOrderNumber = () => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PCGRCDR-${date}-${random}`;
};

exports.createOrder = async (req, res) => {
    try {
        const {
            car,
            pickup,
            return: dropoff,
            customer,
            addOns: addOnsRequest,
            paymentMethod
        } = req.body;

        // --- 1. BUSCAR PRECIOS DE UBICACIONES ---
        const pickupInfo = LOCATIONS.find(l => l.name === pickup.location) || { price: 0 };
        const dropoffInfo = LOCATIONS.find(l => l.name === dropoff.location) || { price: 0 };
        
        const locationTotalFee = pickupInfo.price + dropoffInfo.price;


        let rentalSubtotal = 0;
        let addOnsTotal = 0;
        const taxPercentage = 0.18;

        const carDb = await Car.findById(car.carId);
        if (!carDb) {
            return res.status(404).json({ ok: false, type: 'NotFoundError', message: 'Car not found' });
        }

        const pickupDate = new Date(pickup.date);
        const dropoffDate = new Date(dropoff.date);

        const diffInMs = dropoffDate.getTime() - pickupDate.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);

        // REGLA DE NEGOCIO IGUAL AL FRONTEND:
        let diffInDays = Math.floor(diffInHours / 24);
        const remainingHours = diffInHours % 24;

        // Si se pasa de la hora de entrega por más de 3 minutos (0.05h), cobramos un día extra
        if (remainingHours > 0.05) {
            diffInDays += 1;
        }

        // En tu controlador, después de calcular diffInDays
        if (diffInDays < 3) diffInDays = 3; // Blindaje extra

        rentalSubtotal = carDb.usDayPrice * diffInDays;

        const detailedAddOns = [];
        if (Array.isArray(addOnsRequest)) {
            for (const item of addOnsRequest) {
                const addOnDb = await AddOn.findById(item.addOnId);

                if (addOnDb && addOnDb.active) {
                    const units = parseInt(item.quantity) || 1;

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

        const subtotalGeneral = Number((rentalSubtotal + addOnsTotal + locationTotalFee).toFixed(2));
        const taxAmount = Number((subtotalGeneral * taxPercentage).toFixed(2));
        const totalFinal = Number((subtotalGeneral + taxAmount).toFixed(2));

        const newOrder = new Order({
            orderNumber: generateOrderNumber(),
            car: {
                carId: carDb._id,
                brand: carDb.brand,
                model: carDb.model,
                basePricePerDay: carDb.usDayPrice
            },
            pickup: {
                ...pickup,
                price: pickupInfo.price
            },
            return: {
                ...dropoff,
                price: dropoffInfo.price
            },
            days: diffInDays,
            customer,
            addOns: detailedAddOns,
            financials: {
                locationFee: locationTotalFee,
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




// VERIFICAR LUEGO
exports.updateOrder = async (req, res) => {
    const { id } = req.params;
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
        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'Error updating order.'
        });
    }
};

exports.deleteOrder = async (req, res) => {
    const { id } = req.params;

    try {

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
        const {
            page = 1,
            limit = 10,
            orderNumber,
            status,
            paymentStatus,
            customerName,
            email,
            carId,
            startDate,
            endDate
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        let query = {};

        // FILTROS DE BÚSQUEDA 

        if (orderNumber) {
            query.orderNumber = { $regex: orderNumber, $options: 'i' };
        }

        if (status) {
            query.status = status;
        }

        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }

        if (email) {
            query['customer.email'] = { $regex: email, $options: 'i' };
        }

        if (customerName) {
            query.$or = [
                { 'customer.firstName': { $regex: customerName, $options: 'i' } },
                { 'customer.lastName': { $regex: customerName, $options: 'i' } }
            ];
        }

        if (carId) {
            query['car.carId'] = carId;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        const [orders, totalItems] = await Promise.all([
            Order.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Order.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalItems / limit);

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