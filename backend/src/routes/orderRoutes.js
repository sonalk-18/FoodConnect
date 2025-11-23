const express = require('express');
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const { validateOrder, validateStatusUpdate } = require('../utils/validators');

const router = express.Router();

router.post('/', auth, validateOrder, orderController.createOrder);
router.get('/my', auth, orderController.getMyOrders);
router.get('/', auth, roles(['donor']), orderController.getOrders);
router.put('/:id/status', auth, roles(['donor']), validateStatusUpdate, orderController.updateOrderStatus);

module.exports = router;

