const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const { validateRoleUpdate } = require('../utils/validators');

const router = express.Router();

router.use(auth, roles(['admin']));

router.get('/', userController.getUsers);
router.put('/:id/role', validateRoleUpdate, userController.updateUserRole);

module.exports = router;

