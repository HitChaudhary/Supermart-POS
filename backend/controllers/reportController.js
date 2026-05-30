const Order   = require('../models/Order');
const Product = require('../models/Product');
const User    = require('../models/User');

const dayRange = (dateStr) => {
  const date  = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(date.setHours(0, 0, 0, 0));
  const end   = new Date(date.setHours(23, 59, 59, 999));
  return { start, end };
};

// ── GET /api/reports/dashboard ────────────────────────────────
const getDashboard = async (req, res) => {
  const { start, end } = dayRange();
  const aid = req.adminId;            // always scoped

  const todayOrders = await Order.find({ adminId: aid, createdAt: { $gte: start, $lte: end } });

  const todayRevenue = todayOrders.filter(o => o.paymentStatus !== 'unpaid').reduce((s, o) => s + o.paidAmount, 0);

  const unpaidOrders = await Order.find({ adminId: aid, paymentStatus: { $in: ['partial', 'unpaid'] } });
  const totalDue     = unpaidOrders.reduce((s, o) => s + o.balanceDue, 0);

  const lowStock   = await Product.find({ adminId: aid, stock: { $gt: 0, $lte: 5 }, isActive: true }).select('name stock unit');
  const outOfStock = await Product.countDocuments({ adminId: aid, stock: 0, isActive: true });

  // Cashiers belonging to this admin's business
  const totalCashiers = await User.countDocuments({ adminId: aid, role: 'cashier', isActive: true });

  res.json({
    today: {
      revenue: parseFloat(todayRevenue.toFixed(2)),
      bills  : todayOrders.length,
      paid   : todayOrders.filter(o => o.paymentStatus === 'paid').length,
      partial: todayOrders.filter(o => o.paymentStatus === 'partial').length,
      unpaid : todayOrders.filter(o => o.paymentStatus === 'unpaid').length,
    },
    outstanding : parseFloat(totalDue.toFixed(2)),
    lowStock,
    outOfStock,
    totalCashiers,
  });
};

// ── GET /api/reports/daily ────────────────────────────────────
const getDailyReport = async (req, res) => {
  const { start, end } = dayRange(req.query.date);
  const aid = req.adminId;

  const orders = await Order.find({ adminId: aid, createdAt: { $gte: start, $lte: end } })
    .populate('cashier', 'name');

  const revenue  = orders.reduce((s, o) => s + o.paidAmount, 0);
  const gstTotal = orders.reduce((s, o) => s + o.gst, 0);
  const savings  = orders.reduce((s, o) => s + o.discount, 0);

  const byCashier = {};
  for (const o of orders) {
    const key = o.cashier?._id?.toString() || 'unknown';
    if (!byCashier[key]) byCashier[key] = { name: o.cashier?.name || 'Unknown', bills: 0, revenue: 0 };
    byCashier[key].bills++;
    byCashier[key].revenue += o.paidAmount;
  }

  const methodSplit = orders.reduce((acc, o) => {
    acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + 1;
    return acc;
  }, {});

  res.json({
    date      : start,
    totalBills: orders.length,
    revenue   : parseFloat(revenue.toFixed(2)),
    gstTotal  : parseFloat(gstTotal.toFixed(2)),
    savings   : parseFloat(savings.toFixed(2)),
    byCashier : Object.values(byCashier),
    methodSplit,
    orders,
  });
};

// ── GET /api/reports/monthly ──────────────────────────────────
const getMonthlyReport = async (req, res) => {
  const year  = parseInt(req.query.year)  || new Date().getFullYear();
  const month = parseInt(req.query.month) || new Date().getMonth() + 1;
  const aid   = req.adminId;

  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 0, 23, 59, 59, 999);

  const orders = await Order.find({ adminId: aid, createdAt: { $gte: start, $lte: end } });

  const byDay = {};
  for (const o of orders) {
    const day = o.createdAt.getDate();
    if (!byDay[day]) byDay[day] = { day, bills: 0, revenue: 0, gst: 0 };
    byDay[day].bills++;
    byDay[day].revenue += o.paidAmount;
    byDay[day].gst     += o.gst;
  }

  const summary = Object.values(byDay).map(d => ({
    ...d,
    revenue: parseFloat(d.revenue.toFixed(2)),
    gst    : parseFloat(d.gst.toFixed(2)),
  }));

  res.json({
    year, month,
    totalBills  : orders.length,
    totalRevenue: parseFloat(orders.reduce((s, o) => s + o.paidAmount, 0).toFixed(2)),
    totalGST    : parseFloat(orders.reduce((s, o) => s + o.gst, 0).toFixed(2)),
    byDay       : summary,
  });
};

// ── GET /api/reports/top-products ────────────────────────────
const getTopProducts = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const aid   = req.adminId;

  const result = await Order.aggregate([
    { $match: { adminId: aid } },         // ← scoped
    { $unwind: '$items' },
    {
      $group: {
        _id     : '$items.product',
        name    : { $first: '$items.name' },
        brand   : { $first: '$items.brand' },
        totalQty: { $sum: '$items.qty' },
        revenue : { $sum: '$items.lineTotal' },
      },
    },
    { $sort: { totalQty: -1 } },
    { $limit: limit },
  ]);

  res.json(result);
};

module.exports = { getDashboard, getDailyReport, getMonthlyReport, getTopProducts };
