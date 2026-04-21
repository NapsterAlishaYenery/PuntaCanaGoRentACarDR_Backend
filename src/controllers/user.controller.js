const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('../models/user.model');

// --- REGISTER ---
exports.register = async (req, res) => {
    const { name, email, password, phone, role, active } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const passEncrypt = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: passEncrypt, // Usamos la clave del nuevo modelo
            phone,
            role,
            active
        });

        // Convertimos a objeto para quitar el password de la respuesta
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({
            ok: true,
            data: userResponse,
            message: 'User registered successfully'
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                ok: false,
                type: 'DuplicateError',
                message: 'Email already exists',
            });
        }

        if (error.name === 'ValidationError') {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: firstError,
            });
        }

        res.status(500).json({ ok: false, type: 'ServerError', message: 'Internal server error' });
    }
};

// --- LOGIN ---
exports.login = async (req, res) => {
    const { email, password } = req.body; // Cambiamos username por email (más estándar)

    try {
        // Seleccionamos el password explícitamente ya que tiene select: false
        const userLogin = await User.findOne({ email }).select('+password');

        if (!userLogin) {
            return res.status(401).json({
                ok: false,
                type: 'AuthError',
                message: 'Invalid credentials',
            });
        }

        const validatePassword = await bcrypt.compare(password, userLogin.password);

        if (!validatePassword) {
            return res.status(401).json({
                ok: false,
                type: 'AuthError',
                message: 'Invalid credentials',
            });
        }

        // Generamos el Token con el Role para tus middlewares
        const token = jwt.sign(
            { id: userLogin._id, email: userLogin.email, role: userLogin.role },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        const userResponse = userLogin.toObject();
        delete userResponse.password;

        res.status(200).json({
            ok: true,
            data: { token, user: userResponse },
            message: 'Login successful'
        });

    } catch (error) {
        res.status(500).json({ ok: false, type: 'ServerError', message: 'Internal server error' });
    }
};

// --- UPDATE (Perfil propio) ---
exports.update = async (req, res) => {
    const id = req.user.id; // Viene del authMiddleware
    const updates = req.body;

    try {
        // Bloqueamos que el usuario cambie su propio rol o email por esta vía si quieres más seguridad
        delete updates.role;

        const updateUser = await User.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updateUser) {
            return res.status(404).json({ ok: false, type: 'NotFound', message: 'User not found' });
        }

        res.status(200).json({
            ok: true,
            data: updateUser,
            message: 'User updated successfully'
        });

    } catch (error) {
        res.status(500).json({ ok: false, type: 'ServerError', message: 'Internal server error' });
    }
};

// --- GET ALL USERS (Solo Admin) ---
exports.getAllUsers = async (req, res) => {
    try {
        const { email, role, name } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;

        let query = {};

        if (email) query.email = { $regex: email, $options: 'i' };
        if (name) query.name = { $regex: name, $options: 'i' };
        if (role) query.role = role.toLowerCase();

        const skip = (page - 1) * limit;

        const [users, totalItems] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return res.status(200).json({
            ok: true,
            data: users,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        res.status(500).json({ ok: false, type: 'ServerError', message: 'Error fetching users' });
    }
};

// --- GET USER PROFILE (Perfil propio) ---
exports.getUserProfile = async (req, res) => {
    const id = req.user.id; // Viene del authMiddleware

    try {
        const userProfile = await User.findById(id).select('-password');

        if (!userProfile) {
            return res.status(404).json({
                ok: false,
                type: 'NotFound',
                message: 'User not found'
            });
        }

        res.status(200).json({
            ok: true,
            data: userProfile,
            message: 'Profile retrieved successfully'
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'Internal server error'
        });
    }
};

// --- DELETE USER (Admin borra a cualquiera) ---
exports.deleteUserByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ ok: false, message: 'User not found' });
        }

        res.status(200).json({ ok: true, message: 'User deleted by administrator' });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error deleting user' });
    }
};

// --- DELETE SELF (Usuario se borra a sí mismo) ---
exports.deleteSelf = async (req, res) => {
    try {
        const id = req.user.id; // Viene del token
        await User.findByIdAndDelete(id);

        res.status(200).json({ 
            ok: true, 
            message: 'Your account has been deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error deleting your account' });
    }
};