const express = require('express');
const partnerController = require('../controllers/partnerController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const { validatePartner } = require('../utils/validators');

const router = express.Router();

router.post('/', auth, validatePartner, partnerController.createApplication);
router.get('/', auth, roles(['admin']), partnerController.getPartners);
router.get('/me', auth, partnerController.getMyPartners);
router.get('/:id', auth, partnerController.getPartner);
router.patch('/:id/status', auth, roles(['admin']), partnerController.updateStatus);

module.exports = router;

