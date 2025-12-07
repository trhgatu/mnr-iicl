const Inspection = require('../models/Inspection');
const supabase = require('../config/supabase');
const path = require('path');

// @desc    Get all inspections
// @route   GET /api/inspections
// @access  Private
exports.getInspections = async (req, res, next) => {
    try {
        const inspections = await Inspection.find({ user: req.user.id }).sort({ inspectionDate: -1 });
        res.status(200).json({ success: true, count: inspections.length, data: inspections });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single inspection
// @route   GET /api/inspections/:id
// @access  Private
exports.getInspection = async (req, res, next) => {
    try {
        const inspection = await Inspection.findById(req.params.id);
        if (!inspection) {
            return res.status(404).json({ success: false, message: 'Inspection not found' });
        }
        res.status(200).json({ success: true, data: inspection });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create new inspection
// @route   POST /api/inspections
// @access  Private
exports.createInspection = async (req, res, next) => {
    try {
        req.body.user = req.user.id;

        // --- Supabase Upload Logic ---
        if (req.files) {
            const imagePromises = req.files.map(file => {
                const filePath = `inspections/${Date.now()}-${path.basename(file.originalname)}`;
                return supabase.storage
                    .from('inspection-images')
                    .upload(filePath, file.buffer, {
                        contentType: file.mimetype,
                    });
            });

            const uploadResults = await Promise.all(imagePromises);

            const imageUrls = uploadResults.map(result => {
                if (result.error) {
                    throw new Error(`Supabase upload failed: ${result.error.message}`);
                }
                const { data } = supabase.storage.from('inspection-images').getPublicUrl(result.data.path);
                return data.publicUrl;
            });
            
            req.body.images = imageUrls;
        }
        // --- End Supabase Upload Logic ---
        
        if (req.body.damages) {
            req.body.damages = JSON.parse(req.body.damages);
        }

        const inspection = await Inspection.create(req.body);
        res.status(201).json({ success: true, data: inspection });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update inspection
// @route   PUT /api/inspections/:id
// @access  Private
exports.updateInspection = async (req, res, next) => {
    try {
        let inspection = await Inspection.findById(req.params.id);
        if (!inspection) {
            return res.status(404).json({ success: false, message: 'Inspection not found' });
        }

        // Make sure user is inspection owner
        if (inspection.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to update this inspection' });
        }

        inspection = await Inspection.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: inspection });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete inspection
// @route   DELETE /api/inspections/:id
// @access  Private
exports.deleteInspection = async (req, res, next) => {
    try {
        const inspection = await Inspection.findById(req.params.id);
        if (!inspection) {
            return res.status(404).json({ success: false, message: 'Inspection not found' });
        }

        // Make sure user is inspection owner
        if (inspection.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this inspection' });
        }

        await inspection.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
