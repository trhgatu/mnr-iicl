// @desc    Get repair codes
// @route   GET /api/catalog/repair-codes
// @access  Public
exports.getRepairCodes = (req, res, next) => {
    const repairCodes = [
        { code: 'BF', description: 'Bent/Deformed' },
        { code: 'BR', description: 'Broken' },
        { code: 'CR', description: 'Cracked' },
        { code: 'CS', description: 'Crushed' },
        { code: 'CT', description: 'Cut' },
        { code: 'DE', description: 'Dent' },
        { code: 'DT', description: 'Deteriorated' },
        { code: 'HO', description: 'Hole/Puncture' },
        { code: 'LO', description: 'Loose' },
        { code: 'MI', description: 'Missing' },
        { code: 'SC', description: 'Scratched/Gouged' },
        { code: 'TE', description: 'Torn' },
    ];
    res.status(200).json({ success: true, data: repairCodes });
};

// @desc    Get container types
// @route   GET /api/catalog/container-types
// @access  Public
exports.getContainerTypes = (req, res, next) => {
    const containerTypes = [
        { code: '20GP', description: '20ft General Purpose' },
        { code: '40GP', description: '40ft General Purpose' },
        { code: '40HC', description: '40ft High Cube' },
        { code: '20RF', description: '20ft Reefer' },
        { code: '40RF', description: '40ft Reefer' },
        { code: '20OT', description: '20ft Open Top' },
        { code: '40OT', description: '40ft Open Top' },
    ];
    res.status(200).json({ success: true, data: containerTypes });
};
