const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type    : String,
      required: [true, 'Name is required'],
      trim    : true,
    },

    email: {
      type     : String,
      required : [true, 'Email is required'],
      unique   : true,
      lowercase: true,
      trim     : true,
    },

    password: {
      type     : String,
      required : [true, 'Password is required'],
      minlength: 6,
      select   : false,
    },

    // Three-tier role system
    role: {
      type   : String,
      enum   : ['cashier', 'admin', 'superadmin'],
      default: 'cashier',
    },

    // ── Business ownership ──────────────────────────────────────
    // For cashiers: which admin's business they belong to.
    // For admins: null (they ARE the business owner).
    // For superadmin: null (cross-business).
    adminId: {
      type   : mongoose.Schema.Types.ObjectId,
      ref    : 'User',
      default: null,
      index  : true,
    },

    // Granular permission flags — admin-level feature gating
    permissions: {
      canViewReports   : { type: Boolean, default: false },
      canChangePrices  : { type: Boolean, default: false },
      canLogWastage    : { type: Boolean, default: true  },
      canManageProducts: { type: Boolean, default: false },
    },

    phone    : { type: String, trim: true },
    isActive : { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
