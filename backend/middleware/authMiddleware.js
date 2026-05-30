const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── Verify JWT, attach user ────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
      return res.status(401).json({ message: 'No token, access denied' });

    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user || !req.user.isActive)
      return res.status(401).json({ message: 'User not found or deactivated' });

    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// ── Allow admin OR superadmin ──────────────────────────────────
const adminOnly = (req, res, next) => {
  if (!['admin', 'superadmin'].includes(req.user?.role))
    return res.status(403).json({ message: 'Admin access required' });
  next();
};

// ── Exclusively superadmin ─────────────────────────────────────
const superAdminOnly = (req, res, next) => {
  if (req.user?.role !== 'superadmin')
    return res.status(403).json({ message: 'Super-admin access required' });
  next();
};

// ── Resolve adminId for data scoping ──────────────────────────
// - If the user IS an admin  → their own _id is the adminId
// - If the user is a cashier → look up their admin via the adminId
//   field on their User record (set when superadmin creates them)
// - Attaches req.adminId for use in controllers
const resolveAdminId = async (req, res, next) => {
  try {
    const role = req.user?.role;

    if (role === 'superadmin') {
      // SuperAdmin is not tied to a single business;
      // controllers handle this case individually
      req.adminId = null;
      return next();
    }

    if (role === 'admin') {
      req.adminId = req.user._id;
      return next();
    }

    if (role === 'cashier') {
      // Cashier must have adminId set on their account
      if (!req.user.adminId)
        return res.status(403).json({ message: 'Cashier is not linked to any admin business' });
      req.adminId = req.user.adminId;
      return next();
    }

    return res.status(403).json({ message: 'Unknown role' });
  } catch (err) {
    next(err);
  }
};

module.exports = { protect, adminOnly, superAdminOnly, resolveAdminId };
