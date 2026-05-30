const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── POST /api/auth/login ──────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.isActive)
      return res.status(403).json({ message: 'Account is deactivated. Contact super admin.' });

    const match = await user.matchPassword(password);
    if (!match)
      return res.status(401).json({ message: 'Invalid email or password' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({
      token      : generateToken(user._id),
      _id        : user._id,
      name       : user.name,
      email      : user.email,
      role       : user.role,
      adminId    : user.adminId,
      permissions: user.permissions,
      isActive   : user.isActive,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Login failed' });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Failed to get user' });
  }
};

// ── PUT /api/auth/change-password ─────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: 'Both old and new password are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch)
      return res.status(400).json({ message: 'Incorrect current password' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update password' });
  }
};

// ── EXPORTS ───────────────────────────────────────────────────
module.exports = { login, getMe, changePassword };