const path = require('path');
const { validationResult } = require('express-validator');
const foodModel = require('../models/foodModel');

const buildFilterOptions = (query) => ({
  search: query.search || query.query || undefined,
  category: query.category,
  minPrice: query.minPrice || query.min || undefined,
  maxPrice: query.maxPrice || query.max || undefined
});

exports.getFoods = async (req, res, next) => {
  try {
    const foods = await foodModel.getAllFoods(buildFilterOptions(req.query));
    return res.json(foods);
  } catch (error) {
    return next(error);
  }
};

exports.getFood = async (req, res, next) => {
  try {
    const food = await foodModel.getFoodById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    return res.json(food);
  } catch (error) {
    return next(error);
  }
};

exports.createFood = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const payload = {
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price),
      category: req.body.category,
      image
    };

    const food = await foodModel.createFood(payload);
    return res.status(201).json({
      status: 'success',
      message: 'Food added successfully',
      foodId: food.id,
      food
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateFood = async (req, res, next) => {
  try {
    const existing = await foodModel.getFoodById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Food not found' });
    }

    const image =
      req.file?.filename
        ? `/uploads/${req.file.filename}`
        : req.body.image || existing.image;

    const updated = await foodModel.updateFood(req.params.id, {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price ? Number(req.body.price) : undefined,
      category: req.body.category,
      image
    });
    return res.json({ status: 'success', message: 'Food updated', food: updated });
  } catch (error) {
    return next(error);
  }
};

exports.deleteFood = async (req, res, next) => {
  try {
    const existing = await foodModel.getFoodById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Food not found' });
    }
    await foodModel.deleteFood(req.params.id);
    return res.json({ status: 'success', message: 'Food deleted' });
  } catch (error) {
    return next(error);
  }
};

exports.searchFoods = async (req, res, next) => {
  try {
    const foods = await foodModel.getAllFoods({
      search: req.query.query,
      category: undefined
    });
    return res.json(foods);
  } catch (error) {
    return next(error);
  }
};

exports.filterFoods = async (req, res, next) => {
  try {
    const foods = await foodModel.getAllFoods({
      search: undefined,
      category: req.query.category,
      minPrice: req.query.min,
      maxPrice: req.query.max
    });
    return res.json(foods);
  } catch (error) {
    return next(error);
  }
};

