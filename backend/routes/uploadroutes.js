const express = require('express');
const router  = express.Router();
const upload  = require('../middleware/uploadmiddleware');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// POST /api/upload/product-image
// Returns the file path to save in product.image
router.post('/product-image', protect, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({
    message : 'Image uploaded successfully',
    imageUrl: `/${req.file.path.replace(/\\/g, '/')}`,
  });
});

module.exports = router;