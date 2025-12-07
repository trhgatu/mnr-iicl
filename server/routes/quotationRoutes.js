const express = require('express');
const {
  getQuotations,
  getQuotation,
  createQuotation,
  updateQuotation,
} = require('../controllers/quotationController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getQuotations)
  .post(protect, createQuotation);

router
  .route('/:id')
  .get(protect, getQuotation)
  .put(protect, updateQuotation);

module.exports = router;
