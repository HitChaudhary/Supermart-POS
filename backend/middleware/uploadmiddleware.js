const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Make sure uploads folder exists
const uploadDir = 'uploads/products';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Save files to disk with original extension
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `product-${unique}${path.extname(file.originalname)}`);
  },
});

// Only allow images
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const valid = allowed.test(path.extname(file.originalname).toLowerCase())
             && allowed.test(file.mimetype);
  if (valid) cb(null, true);
  else cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
});

module.exports = upload;