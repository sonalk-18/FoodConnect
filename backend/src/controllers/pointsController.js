const { validationResult } = require('express-validator');
const pointsModel = require('../models/pointsModel');
const userModel = require('../models/userModel');

exports.addPoints = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const { points, sourceType, sourceId, note } = req.body;
    await pointsModel.addEntry({
      userId: req.user.id,
      points,
      sourceType,
      sourceId,
      note,
      direction: 'credit'
    });
    const user = await userModel.incrementPoints(req.user.id, points);
    return res.status(201).json({ user });
  } catch (error) {
    return next(error);
  }
};

exports.getMyPoints = async (req, res, next) => {
  try {
    const history = await pointsModel.getHistoryByUser(req.user.id);
    const user = await userModel.findById(req.user.id);
    return res.json({ balance: user.points, history });
  } catch (error) {
    return next(error);
  }
};

