const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    // ── Business ownership ────────────────────────────────────
    // Every product belongs to one admin's business.
    // SuperAdmin sets this when creating; admin gets it from their own _id.
    adminId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'User',
      required: [true, 'adminId is required'],
      index   : true,
    },

    name: { type: String, required: [true, 'Product name is required'], trim: true },
    brand: { type: String, required: [true, 'Brand is required'], trim: true },

    category: {
      type    : String,
      required: [true, 'Category is required'],
      enum: [
  'Snacks', 
  'Beverages', 
  'Personal Care', 
  'Household Care', 
  'Packaged Foods', 
  'Staples', 
  'Dairy', 
  'Bakery', 
  'Fruits', 
  'Vegetables', 
  'Frozen Foods', 
  'Baby Care', 
  'Other'
]
    },

    subcategory     : { type: String, trim: true },
    price           : { type: Number, required: true, min: 0 },
    originalPrice   : { type: Number, required: true, min: 0 },
    discountPercent : { type: Number, default: 0, min: 0, max: 100 },
    offer           : { type: String, trim: true, default: null },

    unit  : { type: String, required: true, trim: true },
    stock : { type: Number, required: true, min: 0, default: 0 },
    image : { type: String, default: null },

    gift: {
      name  : { type: String, trim: true },
      minQty: { type: Number, min: 1 },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  if (this.originalPrice > 0) {
    this.discountPercent = Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
