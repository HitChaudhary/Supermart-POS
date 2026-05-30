const User = require('../models/User');

// ── GET /api/users/control-panel ─────────────────────────────
// SuperAdmin sees ALL users
const getControlPanel = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch users' });
  }
};

// ── POST /api/users/create ────────────────────────────────────
// SuperAdmin creates a new admin account (top-level business owner)
// Or creates a cashier and assigns them to a specific admin
const createUser = async (req, res) => {
  const { name, email, password, role, phone, permissions, assignToAdminId } = req.body;

  if (!name || !email || !password || !role)
    return res.status(400).json({ message: 'name, email, password and role are required' });

  if (!['cashier', 'admin'].includes(role))
    return res.status(400).json({ message: 'Role must be cashier or admin' });

  try {
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const defaultPerms = role === 'admin'
      ? { canViewReports: true, canChangePrices: true, canLogWastage: true, canManageProducts: true }
      : { canViewReports: false, canChangePrices: false, canLogWastage: true, canManageProducts: false };

    // If superadmin is creating a cashier, they must assign them to an admin
    let adminId = null;
    if (role === 'cashier') {
      if (!assignToAdminId)
        return res.status(400).json({ message: 'assignToAdminId is required when creating a cashier' });
      const admin = await User.findOne({ _id: assignToAdminId, role: 'admin' });
      if (!admin) return res.status(404).json({ message: 'Admin not found for assignToAdminId' });
      adminId = admin._id;
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone      : phone || '',
      adminId,                          // null for admin, set for cashier
      permissions: permissions || defaultPerms,
    });

    res.status(201).json({
      _id        : user._id,
      name       : user.name,
      email      : user.email,
      role       : user.role,
      phone      : user.phone,
      adminId    : user.adminId,
      isActive   : user.isActive,
      permissions: user.permissions,
      createdAt  : user.createdAt,
    });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to create user' });
  }
};

// ── PATCH /api/users/modify-access ───────────────────────────
const modifyAccess = async (req, res) => {
  const { userId, role, isActive, permissions } = req.body;
  if (!userId) return res.status(400).json({ message: 'userId is required' });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user._id.toString() === req.user._id.toString() && role && role !== 'superadmin')
      return res.status(400).json({ message: 'Cannot change your own superadmin role' });

    if (role     !== undefined) user.role     = role;
    if (isActive !== undefined) user.isActive = isActive;

    if (permissions && typeof permissions === 'object') {
      const allowed = ['canViewReports', 'canChangePrices', 'canLogWastage', 'canManageProducts'];
      allowed.forEach(k => { if (permissions[k] !== undefined) user.permissions[k] = permissions[k]; });
    }

    const updated = await user.save();
    res.json({
      _id        : updated._id,
      name       : updated.name,
      email      : updated.email,
      role       : updated.role,
      adminId    : updated.adminId,
      isActive   : updated.isActive,
      permissions: updated.permissions,
    });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to modify access' });
  }
};

// ── DELETE /api/users/:id ─────────────────────────────────────
const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (id === req.user._id.toString())
    return res.status(400).json({ message: 'Cannot delete your own account' });

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'superadmin')
      return res.status(403).json({ message: 'Cannot delete another superadmin account' });

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to delete user' });
  }
};

module.exports = { getControlPanel, createUser, modifyAccess, deleteUser };
