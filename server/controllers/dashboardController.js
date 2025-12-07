const Inspection = require('../models/Inspection');
const Quotation = require('../models/Quotation');

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
exports.getSummary = async (req, res, next) => {
    try {
        const inspectionsToday = await Inspection.countDocuments({ 
            user: req.user.id,
            inspectionDate: {
                $gte: new Date().setHours(0, 0, 0, 0),
                $lt: new Date().setHours(23, 59, 59, 999)
            }
        });
        
        const pendingInspections = await Inspection.countDocuments({ user: req.user.id, status: 'Pending' });
        const pendingQuotations = await Quotation.countDocuments({ user: req.user.id, status: 'Sent' });
        const approvedQuotations = await Quotation.countDocuments({ user: req.user.id, status: 'Approved' });

        const summary = {
            inspectionsToday,
            pendingInspections,
            pendingQuotations,
            approvedQuotations
        };

        res.status(200).json({ success: true, data: summary });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
