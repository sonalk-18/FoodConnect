const express = require('express');
const rewardController = require('../controllers/rewardController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const { validateReward } = require('../utils/validators');

const router = express.Router();

router.get('/', rewardController.getRewards);
router.post('/', auth, roles(['donor']), validateReward, rewardController.createReward);
router.put('/:id', auth, roles(['donor']), rewardController.updateReward);
router.delete('/:id', auth, roles(['donor']), rewardController.deleteReward);
router.post('/redeem', auth, rewardController.redeemReward);

module.exports = router;

