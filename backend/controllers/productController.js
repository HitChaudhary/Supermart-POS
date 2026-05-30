const Product   = require('../models/Product');
const StockLog  = require('../models/StockLog');
const mongoose  = require('mongoose');

// ── GET /api/products ─────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const { category, search, inStock } = req.query;
    // Always scope to this admin's business
    const filter = { isActive: true, adminId: req.adminId };
    if (category && category !== 'All') filter.category = category;
    if (inStock === 'true') filter.stock = { $gt: 0 };
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// ── GET /api/products/:id ─────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, adminId: req.adminId });
    if (!product || !product.isActive)
      return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch {
    res.status(500).json({ message: 'Error retrieving product' });
  }
};

// ── POST /api/products ────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const {
      name, brand, category, subcategory,
      price, originalPrice, offer, unit, stock, image, gift,
    } = req.body;

    let discountPercent = 0;
    if (originalPrice > 0 && price < originalPrice) {
      discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    const product = await Product.create({
      adminId: req.adminId,           // ← scoped to this admin's business
      name, brand, category, subcategory,
      price, originalPrice, discountPercent,
      offer, unit, stock, image, gift,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to create product' });
  }
};

// ── PUT /api/products/:id ─────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, adminId: req.adminId });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (req.body.price !== undefined || req.body.originalPrice !== undefined) {
      const p = req.body.price         ?? product.price;
      const o = req.body.originalPrice ?? product.originalPrice;
      req.body.discountPercent = (o > 0 && p < o)
        ? Math.round(((o - p) / o) * 100) : 0;
    }

    Object.assign(product, req.body);
    res.json(await product.save());
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to update product' });
  }
};

// ── DELETE /api/products/:id (soft) ──────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, adminId: req.adminId });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.isActive = false;
    await product.save();
    res.json({ message: 'Product removed from live catalog' });
  } catch {
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

// ── PATCH /api/products/:id/stock ────────────────────────────
const updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    if (stock < 0) return res.status(400).json({ message: 'Stock cannot be negative' });
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, adminId: req.adminId },
      { stock },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch {
    res.status(400).json({ message: 'Failed to update stock' });
  }
};

// ── POST /api/products/inventory-workspace ───────────────────
const adjustProductInventoryOrPrice = async (req, res) => {
  const { note, adjustments } = req.body;

  if (!adjustments?.length)
    return res.status(400).json({ message: 'No adjustment parameters provided.' });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const logItems = [];

    for (const entry of adjustments) {
      // Scope check: product must belong to this admin
      const product = await Product.findOne({ _id: entry.productId, adminId: req.adminId }).session(session);
      if (!product) throw new Error(`Product not found: ${entry.productId}`);

      const mainDelta = parseInt(entry.mainDelta) || 0;
      const giftDelta = parseInt(entry.giftDelta) || 0;

      if (entry.mode === 'price_override') {
        if (entry.newPrice         !== undefined) product.price         = parseFloat(entry.newPrice);
        if (entry.newOriginalPrice !== undefined) product.originalPrice = parseFloat(entry.newOriginalPrice);
        if (entry.newOffer         !== undefined) product.offer         = entry.newOffer;
        product.discountPercent =
          (product.originalPrice > 0 && product.price < product.originalPrice)
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
        logItems.push({ product: product._id, name: product.name, type: 'main_inward', changedQty: mainDelta, newTotalStock: product.stock });
      }

      else if (entry.mode === 'cargo_inward') {
        if (mainDelta > 0) {
          product.stock += mainDelta;
          logItems.push({ product: product._id, name: product.name, type: 'main_inward', changedQty: mainDelta, newTotalStock: product.stock });
        }
        if (product.gift && giftDelta > 0) {
          if (product.gift.stock == null) product.gift.stock = 0;
          product.gift.stock += giftDelta;
          logItems.push({ product: product._id, name: `🎁 [GIFT] ${product.gift.name} (via ${product.name})`, type: 'gift_inward', changedQty: giftDelta, newTotalStock: product.gift.stock });
        }
      }

      else if (entry.mode === 'damaged_loss') {
        if (mainDelta > 0) {
          if (product.stock < mainDelta) throw new Error(`Damage write-off exceeds stock for "${product.name}"`);
          product.stock -= mainDelta;
          logItems.push({ product: product._id, name: `💥 [DAMAGE] ${product.name}`, type: 'damaged_loss', changedQty: -mainDelta, newTotalStock: product.stock });
        }
      }

      else if (entry.mode === 'expired_loss') {
        if (mainDelta > 0) {
          if (product.stock < mainDelta) throw new Error(`Expiry write-off exceeds stock for "${product.name}"`);
          product.stock -= mainDelta;
          logItems.push({ product: product._id, name: `⏳ [EXPIRY] ${product.name}`, type: 'expired_loss', changedQty: -mainDelta, newTotalStock: product.stock });
        }
      }

      else if (entry.mode === 'audit_correction') {
        const variance = mainDelta - product.stock;
        product.stock  = mainDelta;
        logItems.push({ product: product._id, name: `⚖️ [AUDIT] ${product.name}`, type: 'audit_correction', changedQty: variance, newTotalStock: product.stock });
      }

      await product.save({ session });
    }

    const [committed] = await StockLog.create([{
      adminId   : req.adminId,          // ← scoped
      receivedBy: req.user._id,
      note      : note || 'Inventory Workspace Operation',
      items     : logItems,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: 'Adjustments committed.', batch: committed });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message || 'Transaction aborted.' });
  }
};

// ── GET /api/products/stock-logs ─────────────────────────────
const getStockLogs = async (req, res) => {
  try {
    const logs = await StockLog
      .find({ adminId: req.adminId })           // ← scoped
      .populate({ path: 'receivedBy', select: 'name email role', strictPopulate: false })
      .sort({ createdAt: -1 });

    const safe = (logs || []).map(log => {
      const obj = log.toObject ? log.toObject() : { ...log };
      if (!obj.receivedBy || typeof obj.receivedBy !== 'object') {
        obj.receivedBy = { name: 'System Operator' };
      }
      obj.items = (obj.items || []).map(item => ({
        ...item,
        changedQty: item.changedQty ?? item.addedQty ?? 0,
      }));
      return obj;
    });

    res.status(200).json(safe);
  } catch (err) {
    console.error('getStockLogs error:', err);
    res.status(200).json([]);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  adjustProductInventoryOrPrice,
  getStockLogs,
};
