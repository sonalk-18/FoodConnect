const express = require('express');
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');
const { validateCartItem } = require('../utils/validators');

const router = express.Router();

router.post('/add', auth, validateCartItem, cartController.addItem);
router.get('/', auth, cartController.getCart);
router.delete('/remove/:foodId', auth, cartController.removeItem);

module.exports = router;

