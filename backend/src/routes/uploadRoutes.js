const express = require('express');
const path = require('path');
const multer = require('multer');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only jpeg, png, or webp files allowed'));
    }
    return cb(null, true);
  }
});

router.post('/food', auth, roles(['admin']), upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'Image file is required' });
  }

  return res.status(201).json({
    status: 'success',
    message: 'Image uploaded successfully',
    path: `/uploads/${req.file.filename}`
  });
});

module.exports = router;

