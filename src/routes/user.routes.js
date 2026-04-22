const express = require('express');
const router = express.Router();

// Middlewares de seguridad y control
const authMiddleware = require('../middleware/auth.middleware');
const isAdminMiddleware = require('../middleware/isAdmin.middleware');
const writeLimiter = require('../middleware/rateLimiter.middleware');
const validateUsers = require('../middleware/validate-users.middleware');

// Controlador
const usersController = require('../controllers/user.controller');

// RUTAS PÚBLICAS
router.post('/register', writeLimiter, validateUsers.register, usersController.register);

router.post('/login', writeLimiter, validateUsers.login, usersController.login);


// RUTAS PRIVADAS (Requieren Login)
router.get('/profile', authMiddleware, usersController.getUserProfile);

router.patch('/update', authMiddleware, writeLimiter, validateUsers.update, usersController.update);


// RUTAS de ADMINISTRADOR (Requieren Login + Rol Admin) 

router.get('/all', authMiddleware, isAdminMiddleware, usersController.getAllUsers);

router.delete('/delete-account', authMiddleware, usersController.deleteSelf);

router.delete('/delete/:id', authMiddleware, isAdminMiddleware, validateUsers.id, usersController.deleteUserByAdmin);

module.exports = router;