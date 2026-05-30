const express  = require('express');
const router   = express.Router();
const { getDashboard, getDailyReport, getMonthlyReport, getTopProducts } = require('../controllers/reportController');
const { protect, adminOnly, resolveAdminId } = require('../middleware/authMiddleware');

router.use(protect, adminOnly, resolveAdminId);

router.get('/dashboard',    getDashboard);
router.get('/daily',        getDailyReport);
router.get('/monthly',      getMonthlyReport);
router.get('/top-products', getTopProducts);

module.exports = router;
