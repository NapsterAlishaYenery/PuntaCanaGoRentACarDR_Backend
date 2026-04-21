const express = require('express');
const router = express.Router();

// Middlewares de seguridad y control
const authMiddleware = require('../middleware/auth.middleware');
const isAdminMiddleware = require('../middleware/isAdmin.middleware');
const writeLimiter = require('../middleware/rateLimiter.middleware');
const validateUsers = require('../middleware/validate-users.middleware');

// Controlador
const usersController = require('../controllers/user.controller');

// --- RUTAS PÚBLICAS ---

// Registro de nuevos usuarios/clientes
router.post('/register', writeLimiter, validateUsers.register, usersController.register);

// Login para obtener el Token
router.post('/login', writeLimiter, validateUsers.login, usersController.login);


// --- RUTAS PRIVADAS (Requieren Login) ---

// Ver y actualizar el perfil propio (el ID se saca del token)
router.get('/profile', authMiddleware, usersController.getUserProfile);
router.patch('/update', authMiddleware, writeLimiter, validateUsers.update, usersController.update);


// --- RUTAS de ADMINISTRADOR (Requieren Login + Rol Admin) ---

// Ver todos los usuarios registrados (con paginación y filtros)
router.get('/all', authMiddleware, isAdminMiddleware, usersController.getAllUsers);

// ... dentro de RUTAS PRIVADAS (Login)
router.delete('/delete-account', authMiddleware, usersController.deleteSelf);

// ... dentro de RUTAS ADMINISTRADOR (Login + Admin)
router.delete('/delete/:id', authMiddleware, isAdminMiddleware, validateUsers.id, usersController.deleteUserByAdmin);

module.exports = router;