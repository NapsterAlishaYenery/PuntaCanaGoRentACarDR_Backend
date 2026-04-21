const express = require('express');
const router = express.Router();

// Middlewares de seguridad y validación
const authMiddleware = require('../middleware/auth.middleware');
const isAdminMiddleware = require('../middleware/isAdmin.middleware');
const writeLimiter = require('../middleware/rateLimiter.middleware'); // Para evitar spam de órdenes
const validateOrder = require('../middleware/validate-order.middleware');

// Controlador
const OrderController = require('../controllers/order.controller');

// ==========================================
// RUTAS PÚBLICAS (Para el Front-end / Checkout)
// ==========================================

/**
 * @route   POST /api/orders/create
 * @desc    Crear una nueva reserva desde el Checkout
 * @access  Public
 */
router.post(
    '/create',
    writeLimiter,       // Protegemos contra bots/spam de reservas
    validateOrder.create,
    OrderController.createOrder
);

/**
 * @route   GET /api/orders/thanks-detail/:id
 * @desc    Obtener el detalle de una sola orden
 */
router.get(
    '/thanks-detail/:id',
    validateOrder.id, // <--- Validación de ID necesaria
    OrderController.getOrderById
);


// ==========================================
// RUTAS PRIVADAS (Panel Administrativo)
// ==========================================

/**
 * @route   GET /api/orders/all
 * @desc    Obtener todas las órdenes con filtros (Contabilidad/Admin)
 */
router.get(
    '/all',
    authMiddleware,
    isAdminMiddleware,
    OrderController.getAllOrders
);

/**
 * @route   GET /api/orders/detail/:id
 * @desc    Obtener el detalle de una sola orden
 */
router.get(
    '/detail/:id',
    authMiddleware,
    isAdminMiddleware,
    validateOrder.id, // <--- Validación de ID necesaria
    OrderController.getOrderById
);

/**
 * @route   PATCH /api/orders/update/:id
 * @desc    Actualizar datos o estado de la orden
 */
router.patch(
    '/update/:id',
    authMiddleware,
    isAdminMiddleware,
    writeLimiter,
    validateOrder.id,     // <--- Validación de ID necesaria
    validateOrder.update, // <--- Validación de campos permitidos
    OrderController.updateOrder
);

/**
 * @route   DELETE /api/orders/delete/:id
 * @desc    Borrado lógico (Cambia status a 'cancelled')
 */
router.delete(
    '/delete/:id',
    authMiddleware,
    isAdminMiddleware,
    writeLimiter,
    validateOrder.id, // <--- ¡Añadido! Evita errores de ID mal formado
    OrderController.deleteOrder
);

module.exports = router;