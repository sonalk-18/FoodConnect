const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { validateSignup, validateLogin } = require('../utils/validators');

const router = express.Router();

router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', authController.refreshToken);
router.get('/me', auth, authController.getProfile);

module.exports = router;
