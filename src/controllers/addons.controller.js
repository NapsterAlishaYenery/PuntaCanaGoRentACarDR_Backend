const AddOn = require('../models/addon.model');

exports.createAddOn = async (req, res) => {
    const {
        name,
        description,
        price,
        icon,
        isPerDay,
        maxQuantity,
        active
    } = req.body;

    try {
        const newAddOn = await AddOn.create({
            name,
            description,
            price,
            icon,
            isPerDay,
            maxQuantity,
            active
        });

        res.status(201).json({
            ok: true,
            data: newAddOn,
            message: 'Add-on created successfully'
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: messages[0] || 'Invalid data',
                errors: messages
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: 'An add-on with this name already exists'
            });
        }

        console.error(error);
        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'A critical error occurred on the server'
        });
    }
};

exports.updateAddOn = async (req, res) => {
    const { id } = req.params;
    const update = req.body;

    try {
        const updatedAddOn = await AddOn.findByIdAndUpdate(
            id,
            { $set: update },
            { new: true, runValidators: true }
        );

        if (!updatedAddOn) {
            return res.status(404).json({
                ok: false,
                type: 'NotFoundError',
                message: 'Error: The Add-on does not exist.',
            });
        }

        res.status(200).json({
            ok: true,
            data: updatedAddOn,
            message: 'Add-on updated correctly'
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
};

exports.deleteAddOn = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedAddOn = await AddOn.findByIdAndDelete(id);

        if (!deletedAddOn) {
            return res.status(404).json({
                ok: false,
                type: 'NotFoundError',
                message: 'Error: The Add-on does not exist.',
            });
        }

        res.status(200).json({
            ok: true,
            message: 'Add-on deleted successfully',
            data: deletedAddOn
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'A critical error occurred while deleting.',
        });
    }
};

exports.getAddOnById = async (req, res) => {
    const { id } = req.params;

    try {
        const addOn = await AddOn.findById(id);

        if (!addOn) {
            return res.status(404).json({
                ok: false,
                type: 'NotFoundError',
                message: 'The requested Add-on does not exist.'
            });
        }

        res.status(200).json({
            ok: true,
            data: addOn,
            message: 'Add-on retrieved successfully.'
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'A critical error occurred on the server.',
        });
    }
};

exports.getAllAddOns = async (req, res) => {
    try {
        const { active, name } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50; 

        let query = {};

        if (active !== undefined) {
            query.active = active === 'true';
        }

        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }

        const skip = (page - 1) * limit;

        const [allAddOns, totalItems] = await Promise.all([
            AddOn.find(query)
                .sort({ name: 1 })
                .skip(skip)
                .limit(limit),
            AddOn.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalItems / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return res.status(200).json({
            ok: true,
            data: allAddOns,
            message: totalItems > 0 ? 'Add-ons retrieved successfully.' : 'No Add-ons found.',
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
        console.error(error);
        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'A critical error occurred on the server while fetching add-ons.',
        });
    }
};