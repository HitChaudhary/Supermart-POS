const express  = require('express');
const router   = express.Router();
const { getCashiers, createCashier, updateCashier, toggleCashier, deleteCashier } = require('../controllers/cashierController');
const { protect, adminOnly, resolveAdminId } = require('../middleware/authMiddleware');

router.use(protect, adminOnly, resolveAdminId);

router.get   ('/',           getCashiers);
router.post  ('/',           createCashier);
router.put   ('/:id',        updateCashier);
router.patch ('/:id/toggle', toggleCashier);
router.delete('/:id',        deleteCashier);

module.exports = router;
