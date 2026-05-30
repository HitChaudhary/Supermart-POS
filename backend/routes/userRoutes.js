const express          = require('express');
const router           = express.Router();
const { getControlPanel, createUser, modifyAccess, deleteUser } = require('../controllers/userController');
const { protect, superAdminOnly } = require('../middleware/authMiddleware');

// All routes: superadmin only
router.get   ('/control-panel',  protect, superAdminOnly, getControlPanel);
router.post  ('/create',         protect, superAdminOnly, createUser);
router.patch ('/modify-access',  protect, superAdminOnly, modifyAccess);
router.delete('/:id',            protect, superAdminOnly, deleteUser);

module.exports = router;
