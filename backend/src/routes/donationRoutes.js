const express = require('express');
const donationController = require('../controllers/donationController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const { validateDonation } = require('../utils/validators');

const router = express.Router();

router.post('/', auth, validateDonation, donationController.createDonation);
router.get('/', auth, roles(['donor']), donationController.getDonations);
router.get('/me', auth, donationController.getMyDonations);
router.get('/:id', auth, donationController.getDonation);
router.patch('/:id/status', auth, roles(['donor']), donationController.updateDonationStatus);

module.exports = router;

