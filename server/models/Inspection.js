const mongoose = require('mongoose');

const DamageSchema = new mongoose.Schema({
    location: { type: String, required: true },
    type: { type: String, required: true },
    severity: { type: String, required: true },
    size: { type: String },
});

const InspectionSchema = new mongoose.Schema({
  containerId: {
    type: String,
    required: [true, 'Please add a container ID'],
    trim: true,
  },
  inspectionDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Đạt', 'Cần sửa chữa', 'Không đạt', 'Đã có báo giá'],
    default: 'Pending',
  },
  images: [
    { type: String } // Stores paths to the images
  ],
  damages: [DamageSchema],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Inspection', InspectionSchema);
