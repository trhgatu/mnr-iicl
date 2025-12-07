const express = require('express');
const { getRepairCodes, getContainerTypes } = require('../controllers/catalogController');

const router = express.Router();

router.get('/repair-codes', getRepairCodes);
router.get('/container-types', getContainerTypes);

module.exports = router;
