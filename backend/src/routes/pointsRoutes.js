const express = require('express');
const pointsController = require('../controllers/pointsController');
const auth = require('../middleware/auth');
const { validatePointsAward } = require('../utils/validators');

const router = express.Router();

router.post('/add', auth, validatePointsAward, pointsController.addPoints);
router.get('/me', auth, pointsController.getMyPoints);

module.exports = router;

