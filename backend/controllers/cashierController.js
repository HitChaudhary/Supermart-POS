const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ── GET /api/cashiers ─────────────────────────────────────────
// Returns only cashiers belonging to this admin's business
const getCashiers = async (req, res) => {
  try {
    const cashiers = await User.find({
      role   : 'cashier',
      adminId: req.adminId,           // ← scoped
    }).select('-password').sort({ createdAt: -1 });
    res.json(cashiers);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch cashiers' });
  }
};

// ── POST /api/cashiers ────────────────────────────────────────
const createCashier = async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'name, email and password are required' });

  try {
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const cashier = await User.create({
      name,
      email,
      password,
      phone  : phone || '',
      role   : 'cashier',
      adminId: req.adminId,           // ← link cashier to this admin
      permissions: {
        canViewReports   : false,
        canChangePrices  : false,
        canLogWastage    : true,
        canManageProducts: false,
      },
    });

    res.status(201).json({
      _id      : cashier._id,
      name     : cashier.name,
      email    : cashier.email,
      phone    : cashier.phone,
      role     : cashier.role,
      adminId  : cashier.adminId,
      isActive : cashier.isActive,
      createdAt: cashier.createdAt,
    });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to create cashier' });
  }
};

// ── PUT /api/cashiers/:id ─────────────────────────────────────
const updateCashier = async (req, res) => {
  try {
    // Must belong to this admin's business
    const cashier = await User.findOne({ _id: req.params.id, adminId: req.adminId, role: 'cashier' });
    if (!cashier) return res.status(404).json({ message: 'Cashier not found' });

    const { name, phone, password } = req.body;
    if (name)  cashier.name  = name;
    if (phone) cashier.phone = phone;
    if (password) {
      if (password.length < 6) return res.status(400).json({ message: 'Password min 6 characters' });
      cashier.password = password;   // pre-save hook hashes it
    }

    const updated = await cashier.save();
    res.json({
      _id      : updated._id,
      name     : updated.name,
      email    : updated.email,
      phone    : updated.phone,
      isActive : updated.isActive,
      createdAt: updated.createdAt,
    });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to update cashier' });
  }
};

// ── PATCH /api/cashiers/:id/toggle ───────────────────────────
const toggleCashier = async (req, res) => {
  try {
    const cashier = await User.findOne({ _id: req.params.id, adminId: req.adminId, role: 'cashier' });
    if (!cashier) return res.status(404).json({ message: 'Cashier not found' });
    cashier.isActive = !cashier.isActive;
    await cashier.save();
    res.json({ _id: cashier._id, isActive: cashier.isActive });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to toggle cashier' });
  }
};

// ── DELETE /api/cashiers/:id ──────────────────────────────────
const deleteCashier = async (req, res) => {
  try {
    const cashier = await User.findOne({ _id: req.params.id, adminId: req.adminId, role: 'cashier' });
    if (!cashier) return res.status(404).json({ message: 'Cashier not found' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cashier deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to delete cashier' });
  }
};

module.exports = { getCashiers, createCashier, updateCashier, toggleCashier, deleteCashier };
