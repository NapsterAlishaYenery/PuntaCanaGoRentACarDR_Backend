const express = require('express');
const router = express.Router();

const authMiddleware  = require('../middleware/auth.middleware');
const isAdminMiddleware = require('../middleware/isAdmin.middleware');
const writeLimiter = require('../middleware/rateLimiter.middleware');
const validateCars = require('../middleware/validate-cars.middleware');

// Controlador
const CarsController = require('../controllers/cars.controller');

// RUTAS PUBLICAS 
router.get('/all', CarsController.getAllCars);

router.get('/detail/:id', validateCars.id, CarsController.getCarById);

router.get('/info/:slug', CarsController.getCarBySlug);

// RUTAS PRIVADAS
router.post('/create', authMiddleware , isAdminMiddleware, writeLimiter, validateCars.create, CarsController.createCars);

router.patch('/update/:id', authMiddleware , isAdminMiddleware, writeLimiter, validateCars.id, validateCars.update, CarsController.updateCars);

router.delete('/delete/:id', authMiddleware , isAdminMiddleware, writeLimiter, validateCars.id, CarsController.deleteCars);


module.exports = router