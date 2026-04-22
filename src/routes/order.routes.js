const express = require('express');
const router = express.Router();

// Middlewares de seguridad y validación
const authMiddleware = require('../middleware/auth.middleware');
const isAdminMiddleware = require('../middleware/isAdmin.middleware');
const writeLimiter = require('../middleware/rateLimiter.middleware'); // Para evitar spam de órdenes
const validateOrder = require('../middleware/validate-order.middleware');

// Controlador
const OrderController = require('../controllers/order.controller');


// RUTAS PÚBLICAS (Para el Front-end / Checkout)
router.post(
    '/create',
    writeLimiter,  
    validateOrder.create,
    OrderController.createOrder
);


router.get(
    '/thanks-detail/:id',
    validateOrder.id,
    OrderController.getOrderById
);


// RUTAS PRIVADAS (Panel Administrativo)

router.get(
    '/all',
    authMiddleware,
    isAdminMiddleware,
    OrderController.getAllOrders
);

router.get(
    '/detail/:id',
    authMiddleware,
    isAdminMiddleware,
    validateOrder.id, 
    OrderController.getOrderById
);

router.patch(
    '/update/:id',
    authMiddleware,
    isAdminMiddleware,
    writeLimiter,
    validateOrder.id,    
    validateOrder.update, 
    OrderController.updateOrder
);

router.delete(
    '/delete/:id',
    authMiddleware,
    isAdminMiddleware,
    writeLimiter,
    validateOrder.id, 
    OrderController.deleteOrder
);

module.exports = router;