const express = require('express');
const gameController = require('../controllers/gameController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const { validateGame } = require('../utils/validators');

const router = express.Router();

router.get('/', gameController.listGames);
router.post('/', auth, roles(['admin']), validateGame, gameController.createGame);
router.put('/:id', auth, roles(['admin']), gameController.updateGame);
router.delete('/:id', auth, roles(['admin']), gameController.deleteGame);

module.exports = router;

