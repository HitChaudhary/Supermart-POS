const mongoose = require('mongoose');

const stockLogSchema = new mongoose.Schema({
  // ── Business ownership ──────────────────────────────────────
  adminId: {
    type    : mongoose.Schema.Types.ObjectId,
    ref     : 'User',
    required: [true, 'adminId is required'],
    index   : true,
  },

  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  note      : { type: String, default: 'Warehouse Operation' },

  items: [{
    product      : { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name         : { type: String, required: true },
    type         : {
      type    : String,
      enum    : ['main', 'gift', 'main_inward', 'gift_inward', 'damaged_loss', 'expired_loss', 'audit_correction'],
      required: true,
    },
    changedQty    : { type: Number },
    addedQty      : { type: Number },
    newTotalStock : { type: Number, required: true },
  }],
}, { timestamps: true });

module.exports = mongoose.model('StockLog', stockLogSchema);
