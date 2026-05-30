const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product        : { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name           : { type: String, required: true },
    brand          : { type: String },
    price          : { type: Number, required: true },
    originalPrice  : { type: Number },
    discountPercent: { type: Number, default: 0 },
    unit           : { type: String },
    qty            : { type: Number, required: true, min: 0.5 },
    lineTotal      : { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // ── Business ownership ────────────────────────────────────
    adminId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'User',
      required: [true, 'adminId is required'],
      index   : true,
    },

    billNumber: { type: String, required: true, unique: true },

    cashier: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'User',
      required: true,
    },

    items     : [orderItemSchema],
    subtotal  : { type: Number, required: true },
    discount  : { type: Number, default: 0 },
    gst       : { type: Number, required: true },
    total     : { type: Number, required: true },

    paymentMethod: {
      type    : String,
      enum    : ['cash', 'upi', 'card'],
      required: true,
    },

    paymentStatus: {
      type   : String,
      enum   : ['paid', 'partial', 'unpaid'],
      default: 'paid',
    },

    paidAmount: { type: Number, default: 0 },
    changeDue : { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },

    gifts: [{ name: { type: String }, fromProduct: { type: String } }],
  },
  { timestamps: true }
);

orderSchema.pre('validate', function (next) {
  if (!this.billNumber) {
    this.billNumber = `SM-${Date.now().toString().slice(-6)}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
