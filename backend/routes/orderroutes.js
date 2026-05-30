const express  = require('express');
const router   = express.Router();
const { createOrder, getOrders, getOrderById, updatePaymentStatus } = require('../controllers/orderController');
const { protect, adminOnly, resolveAdminId } = require('../middleware/authMiddleware');

router.use(protect, resolveAdminId);

router.post('/',              createOrder);
router.get ('/',              getOrders);
router.get ('/:id',           getOrderById);
router.patch('/:id/payment',  adminOnly, updatePaymentStatus);

module.exports = router;
