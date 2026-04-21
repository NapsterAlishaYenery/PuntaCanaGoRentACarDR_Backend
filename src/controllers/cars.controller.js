const Cars = require('../models/car.model')


exports.createCars = async (req, res) => {

    const {
        brand,
        model,
        category,
        seats,
        bags,
        doors,
        transmission,
        fuel,
        usDayPrice,
        description,
        imageurl,
        features, // Este es el opcional
        deposit
    } = req.body;

    try {

        const newCar = await Cars.create({
            brand,
            model,
            category,
            seats,
            bags,
            doors,
            transmission,
            fuel,
            usDayPrice,
            description,
            imageurl,
            features,
            deposit
        });

        res.status(201).json({
            ok: true,
            data: newCar,
            message: 'New Car Added sussesfully'
        });

    } catch (error) {

        if (error.name === 'ValidationError') {
            // TIP: Puedes mapear los errores para decir EXACTAMENTE qué falló
            const messages = Object.values(error.errors).map(val => val.message);

            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: messages.length > 0 ? messages[0] : 'Invalid data',
                errors: messages // Esto ayuda mucho en el desarrollo
            });
        }

        console.error(error); // Siempre loguea el error real para ti en la consola
        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'A critical error occurred on the server'
        });
    }
}

exports.updateCars = async (req, res) => {
    const { id } = req.params;
    const update = req.body;

    try {

        const updateCars = await Cars.findByIdAndUpdate(
            id,
            { $set: update },
            { new: true, runValidators: true }
        );

        if (!updateCars) {
            return res.status(404).json({
                ok: false,
                type: 'NotFoundError',
                message: 'Error: The Car does not exist.',
            });
        }

        res.status(200).json({
            ok: true,
            data: updateCars,
            message: 'Car updated correctly'
        });


    } catch (error) {

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: 'One or more fields are invalid',
            });
        }

        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'A critical error occurred on the server'
        });
    }
}

exports.deleteCars = async (req, res) => {

    const { id } = req.params;

    try {
        const deleteCar = await Cars.findByIdAndDelete(id);

        if (!deleteCar) {
            return res.status(404).json({
                ok: false,
                type: 'NotFoundError',
                message: 'Error: The Car you are trying to delete does not exist.',
            });
        }

        res.status(200).json({
            ok: true,
            message: 'Car deleted successfully',
            data: deleteCar
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'A critical error occurred while deleting.',
        });
    }
}

exports.getCarById = async (req, res) => {

    const { id } = req.params;

    try {

        const car = await Cars.findById(id);

        if (!car) {
            return res.status(404).json({
                ok: false,
                type: 'NotFoundError',
                message: 'The requested car does not exist.'
            });
        }

        res.status(200).json({
            ok: true,
            data: car,
            message: 'Car retrieved successfully.'
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'A critical error occurred on the server.',
        });
    }
}

exports.getCarBySlug = async (req, res) => {
    const { slug } = req.params;

    try {
        // Usamos findOne porque buscamos por un campo personalizado (slug)
        const car = await Cars.findOne({ slug });

        if (!car) {
            return res.status(404).json({
                ok: false,
                type: 'NotFoundError',
                message: 'El vehículo solicitado no existe (Slug inválido).'
            });
        }

        res.status(200).json({
            ok: true,
            data: car,
            message: 'Car retrieved successfully by slug.'
        });

    } catch (error) {
        console.error('GET_CAR_BY_SLUG_ERROR:', error);
        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'Ocurrió un error crítico en el servidor.',
        });
    }
};

exports.getAllCars = async (req, res) => {

    try {
        // 1. EXTRAER LAS VARIABLES DE req.query
        const { brand, category, model } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;

        let query = {};

        if (brand) {
            query.brand = { $regex: brand, $options: 'i' };
        }

        if (category) {
            query.category = { $regex: category, $options: 'i' };
        }

        if (model) {
            query.model = { $regex: model, $options: 'i' };
        }

        const skip = (page - 1) * limit;

        const [allCars, totalItems] = await Promise.all([
            Cars.find(query)
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(limit),
            Cars.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalItems / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return res.status(200).json({
            ok: true,
            data: allCars,
            message: totalItems > 0 ? 'Cars retrieved successfully.' : 'No Cars found.',
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
                hasNextPage,
                hasPrevPage
            }
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'A critical error occurred on the server while fetching cars.',
        });
    }

}

