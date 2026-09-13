const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { ensureAuth } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'shop-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  cb(null, extOk && mimeOk);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/', ensureAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No valid image uploaded. Allowed: jpg, png, gif, webp (max 5MB)' });
  res.json({ url: '/uploads/' + req.file.filename });
});

module.exports = router;
