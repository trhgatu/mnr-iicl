const mongoose = require('mongoose');

const LineItemSchema = new mongoose.Schema({
    description: { type: String, required: true },
    code: { type: String }, // e.g., IICL repair code
    quantity: { type: Number, default: 1 },
    cost: { type: Number, required: true },
});

const QuotationSchema = new mongoose.Schema({
  inspection: {
    type: mongoose.Schema.ObjectId,
    ref: 'Inspection',
    required: true,
  },
  quotationId: {
    type: String,
    unique: true,
  },
  status: {
    type: String,
    enum: ['Nháp', 'Đã gửi', 'Đã duyệt', 'Từ chối'],
    default: 'Nháp',
  },
  lineItems: [LineItemSchema],
  totalCost: {
    type: Number,
  },
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

// Auto-generate quotationId and calculate totalCost before saving
QuotationSchema.pre('save', async function (next) {
    if (this.isNew) {
        // Example: Q-YYYYMMDD-XXXX
        const date = new Date();
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        this.quotationId = `Q-${year}${month}${day}-${random}`;
    }

    if (this.isModified('lineItems')) {
        this.totalCost = this.lineItems.reduce((acc, item) => acc + (item.cost * item.quantity), 0);
    }
    next();
});

module.exports = mongoose.model('Quotation', QuotationSchema);
