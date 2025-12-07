const Quotation = require('../models/Quotation');
const Inspection = require('../models/Inspection');

// @desc    Get all quotations
// @route   GET /api/quotations
// @access  Private
exports.getQuotations = async (req, res, next) => {
    try {
        const quotations = await Quotation.find({ user: req.user.id }).populate('inspection', 'containerId inspectionDate owner containerType');
        res.status(200).json({ success: true, count: quotations.length, data: quotations });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single quotation
// @route   GET /api/quotations/:id
// @access  Private
exports.getQuotation = async (req, res, next) => {
    try {
        const quotation = await Quotation.findById(req.params.id).populate('inspection');
        if (!quotation) {
            return res.status(404).json({ success: false, message: 'Quotation not found' });
        }
        res.status(200).json({ success: true, data: quotation });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create new quotation
// @route   POST /api/quotations
// @access  Private
exports.createQuotation = async (req, res, next) => {
    try {
        req.body.user = req.user.id;

        // Verify inspection exists
        const inspection = await Inspection.findById(req.body.inspection);
        if (!inspection) {
            return res.status(404).json({ success: false, message: 'Inspection not found' });
        }

        const quotation = await Quotation.create(req.body);

        // Update inspection status
        await Inspection.findByIdAndUpdate(req.body.inspection, { status: 'Đã có báo giá' });

        res.status(201).json({ success: true, data: quotation });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update quotation
// @route   PUT /api/quotations/:id
// @access  Private
exports.updateQuotation = async (req, res, next) => {
    try {
        let quotation = await Quotation.findById(req.params.id);
        if (!quotation) {
            return res.status(404).json({ success: false, message: 'Quotation not found' });
        }

        if (quotation.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'User not authorized to update this quotation' });
        }

        quotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: quotation });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
