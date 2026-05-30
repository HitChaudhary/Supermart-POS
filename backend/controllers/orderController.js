const Order          = require('../models/Order');
const Product        = require('../models/Product');
const calcFinancials = require('../utils/Calcfinancials');

// ── POST /api/orders ──────────────────────────────────────────
const createOrder = async (req, res) => {
  const { items, paymentMethod, paymentStatus, paidAmount, gifts } = req.body;

  if (!items || items.length === 0)
    return res.status(400).json({ message: 'Order must have at least one item' });

  const resolvedItems = [];
  for (const item of items) {
    // Product must belong to the same admin business
    const product = await Product.findOne({ _id: item.product, adminId: req.adminId, isActive: true });
    if (!product)
      return res.status(400).json({ message: `Product not found: ${item.product}` });
    if (product.stock < item.qty)
      return res.status(400).json({ message: `Insufficient stock for ${product.name}` });

    resolvedItems.push({
      product        : product._id,
      name           : product.name,
      brand          : product.brand,
      price          : product.price,
      originalPrice  : product.originalPrice,
      discountPercent: product.discountPercent,
      unit           : product.unit,
      qty            : item.qty,
      lineTotal      : parseFloat((product.price * item.qty).toFixed(2)),
    });
  }

  const fin = calcFinancials(resolvedItems, paymentStatus, paidAmount);

  for (const item of resolvedItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
  }

  const order = await Order.create({
    adminId      : req.adminId,         // ← scoped to admin's business
    cashier      : req.user._id,
    items        : resolvedItems,
    paymentMethod,
    paymentStatus,
    gifts        : gifts || [],
    ...fin,
  });

  await order.populate('cashier', 'name email');
  res.status(201).json(order);
};

// ── GET /api/orders ───────────────────────────────────────────
const getOrders = async (req, res) => {
  const { status, date, page = 1, limit = 20 } = req.query;

  // Always scope to admin's business
  const filter = { adminId: req.adminId };

  // Cashiers only see their own bills
  if (req.user.role === 'cashier') filter.cashier = req.user._id;

  if (status) filter.paymentStatus = status;
  if (date) {
    const start = new Date(date);
    const end   = new Date(date);
    end.setHours(23, 59, 59, 999);
    filter.createdAt = { $gte: start, $lte: end };
  }

  const total  = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate('cashier', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ orders, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
};

// ── GET /api/orders/:id ───────────────────────────────────────
const getOrderById = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, adminId: req.adminId })
    .populate('cashier', 'name email');
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (req.user.role === 'cashier' && order.cashier._id.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Access denied' });

  res.json(order);
};

// ── PATCH /api/orders/:id/payment ─────────────────────────────
const updatePaymentStatus = async (req, res) => {
  const { paymentStatus, paidAmount } = req.body;

  const order = await Order.findOne({ _id: req.params.id, adminId: req.adminId });
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.paymentStatus = paymentStatus;

  if (paymentStatus === 'paid') {
    order.paidAmount = order.total;
    order.balanceDue = 0;
    order.changeDue  = 0;
  } else if (paymentStatus === 'partial') {
    order.paidAmount = Math.min(parseFloat(paidAmount) || 0, order.total);
    order.balanceDue = parseFloat((order.total - order.paidAmount).toFixed(2));
  } else {
    order.paidAmount = 0;
    order.balanceDue = order.total;
  }

  await order.save();
  res.json(order);
};

module.exports = { createOrder, getOrders, getOrderById, updatePaymentStatus };
