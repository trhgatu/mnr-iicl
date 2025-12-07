const express = require('express');
const { analyzeDamage } = require('../controllers/aiController');
const { protect } = require('../middlewares/auth');
const multer = require('multer');

// For AI analysis, we might just need the buffer in memory, but for consistency let's use multer
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// The route expects images, similar to the inspection creation
router.post('/analyze-damage', protect, upload.array('files', 10), analyzeDamage);

module.exports = router;
