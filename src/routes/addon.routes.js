const express = require('express');
const router = express.Router();

// Middlewares de seguridad y validación
const authMiddleware = require('../middleware/auth.middleware');
const isAdminMiddleware = require('../middleware/isAdmin.middleware');
const writeLimiter = require('../middleware/rateLimiter.middleware');
const validateAddOns = require('../middleware/validate-addons.middleware');

// Controlador
const AddOnController = require('../controllers/addons.controller');

// ==========================================
// RUTAS PÚBLICAS (Para el Front-end / Checkout)
// ==========================================

// Obtener todos los add-ons (puedes filtrar por ?active=true en Angular)
router.get('/all', AddOnController.getAllAddOns);

// Obtener detalle de un add-on específico
router.get('/detail/:id', validateAddOns.id, AddOnController.getAddOnById);


// ==========================================
// RUTAS PRIVADAS (Solo Admin + Auth + Rate Limiter)
// ==========================================

// Crear un nuevo Add-on
router.post(
    '/create', 
    authMiddleware, 
    isAdminMiddleware, 
    writeLimiter, 
    validateAddOns.create, 
    AddOnController.createAddOn
);

// Actualizar un Add-on existente
router.patch(
    '/update/:id', 
    authMiddleware, 
    isAdminMiddleware, 
    writeLimiter, 
    validateAddOns.id, 
    validateAddOns.update, 
    AddOnController.updateAddOn
);

// Eliminar un Add-on
router.delete(
    '/delete/:id', 
    authMiddleware, 
    isAdminMiddleware, 
    writeLimiter, 
    validateAddOns.id, 
    AddOnController.deleteAddOn
);

module.exports = router;