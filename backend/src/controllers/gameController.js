const { validationResult } = require('express-validator');
const gameModel = require('../models/gameModel');

exports.listGames = async (_req, res, next) => {
  try {
    const games = await gameModel.getGames();
    return res.json(games);
  } catch (error) {
    return next(error);
  }
};

exports.createGame = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const game = await gameModel.createGame({
      title: req.body.title,
      description: req.body.description,
      url: req.body.url,
      iconUrl: req.body.iconUrl,
      pointsPerPlay: req.body.pointsPerPlay,
      tags: req.body.tags
    });
    return res.status(201).json(game);
  } catch (error) {
    return next(error);
  }
};

exports.updateGame = async (req, res, next) => {
  try {
    const game = await gameModel.updateGame(req.params.id, req.body);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    return res.json(game);
  } catch (error) {
    return next(error);
  }
};

exports.deleteGame = async (req, res, next) => {
  try {
    await gameModel.deleteGame(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

