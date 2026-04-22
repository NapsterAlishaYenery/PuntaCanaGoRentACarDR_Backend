const express = require('express');
const router = express.Router();

// Middlewares de seguridad y validación
const authMiddleware = require('../middleware/auth.middleware');
const isAdminMiddleware = require('../middleware/isAdmin.middleware');
const writeLimiter = require('../middleware/rateLimiter.middleware');
const validateAddOns = require('../middleware/validate-addons.middleware');

// Controlador
const AddOnController = require('../controllers/addons.controller');


// RUTAS PÚBLICAS (Para el Front-end / Checkout)
router.get('/all', AddOnController.getAllAddOns);

router.get('/detail/:id', validateAddOns.id, AddOnController.getAddOnById);


// RUTAS PRIVADAS (Solo Admin + Auth + Rate Limiter)

router.post(
    '/create', 
    authMiddleware, 
    isAdminMiddleware, 
    writeLimiter, 
    validateAddOns.create, 
    AddOnController.createAddOn
);

router.patch(
    '/update/:id', 
    authMiddleware, 
    isAdminMiddleware, 
    writeLimiter, 
    validateAddOns.id, 
    validateAddOns.update, 
    AddOnController.updateAddOn
);

router.delete(
    '/delete/:id', 
    authMiddleware, 
    isAdminMiddleware, 
    writeLimiter, 
    validateAddOns.id, 
    AddOnController.deleteAddOn
);

module.exports = router;