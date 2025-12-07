const express = require('express');
const {
  getInspections,
  getInspection,
  createInspection,
  updateInspection,
  deleteInspection,
} = require('../controllers/inspectionController');
const { protect } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router
  .route('/')
  .get(protect, getInspections)
  .post(protect, upload.array('images', 10), createInspection); // Upload up to 10 images

router
  .route('/:id')
  .get(protect, getInspection)
  .put(protect, updateInspection)
  .delete(protect, deleteInspection);

module.exports = router;
