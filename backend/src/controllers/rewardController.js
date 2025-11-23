const { validationResult } = require('express-validator');
const rewardModel = require('../models/rewardModel');
const pointsModel = require('../models/pointsModel');
const userModel = require('../models/userModel');
const pool = require('../models/db');

exports.getRewards = async (_req, res, next) => {
  try {
    const rewards = await rewardModel.getRewards();
    return res.json(rewards);
  } catch (error) {
    return next(error);
  }
};

exports.createReward = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const reward = await rewardModel.createReward({
      title: req.body.title,
      description: req.body.description,
      image: req.body.image,
      pointsRequired: req.body.pointsRequired,
      inventory: req.body.inventory ?? 0,
      isActive: req.body.isActive ?? true
    });
    return res.status(201).json(reward);
  } catch (error) {
    return next(error);
  }
};

exports.updateReward = async (req, res, next) => {
  try {
    const reward = await rewardModel.updateReward(req.params.id, req.body);
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }
    return res.json(reward);
  } catch (error) {
    return next(error);
  }
};

exports.deleteReward = async (req, res, next) => {
  try {
    await rewardModel.deleteReward(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

exports.redeemReward = async (req, res, next) => {
  const rewardId = req.body.rewardId;
  if (!rewardId) {
    return res.status(422).json({ message: 'rewardId is required' });
  }

  try {
    const reward = await rewardModel.getRewardById(rewardId);
    if (!reward || !reward.isActive) {
      return res.status(404).json({ message: 'Reward not available' });
    }

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.points < reward.pointsRequired) {
      return res.status(400).json({ message: 'Not enough points to redeem' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await rewardModel.decrementInventory(rewardId, connection);
      await userModel.incrementPoints(req.user.id, -reward.pointsRequired, connection);
      await pointsModel.addEntry(
        {
          userId: req.user.id,
          points: reward.pointsRequired,
          sourceType: 'reward',
          sourceId: rewardId,
          note: `Redeemed ${reward.title}`,
          direction: 'debit'
        },
        connection
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    const updatedUser = await userModel.findById(req.user.id);
    return res.json({
      message: 'Reward redeemed successfully',
      reward,
      user: updatedUser
    });
  } catch (error) {
    return next(error);
  }
};

