const express = require('express');
const path = require('path');
const multer = require('multer');
const foodController = require('../controllers/foodController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const { validateFood } = require('../utils/validators');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
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

router.get('/', foodController.getFoods);
router.get('/search', foodController.searchFoods);
router.get('/filter', foodController.filterFoods);
router.get('/:id', foodController.getFood);
router.post('/', auth, roles(['admin']), upload.single('image'), validateFood, foodController.createFood);
router.put('/:id', auth, roles(['admin']), upload.single('image'), foodController.updateFood);
router.delete('/:id', auth, roles(['admin']), foodController.deleteFood);

module.exports = router;

