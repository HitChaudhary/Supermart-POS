const express  = require('express');
const router   = express.Router();
const {
  getProducts, getProductById, createProduct, updateProduct,
  deleteProduct, updateStock, adjustProductInventoryOrPrice, getStockLogs,
} = require('../controllers/productController');
const { protect, adminOnly, resolveAdminId } = require('../middleware/authMiddleware');

// All product routes resolve adminId first
router.use(protect, resolveAdminId);

router.get ('/stock-logs',          adminOnly, getStockLogs);
router.post('/inventory-workspace', adminOnly, adjustProductInventoryOrPrice);

router.get ('/',      getProducts);
router.get ('/:id',   getProductById);
router.post('/',      adminOnly, createProduct);
router.put ('/:id',   adminOnly, updateProduct);
router.delete('/:id', adminOnly, deleteProduct);
router.patch('/:id/stock', adminOnly, updateStock);

module.exports = router;
