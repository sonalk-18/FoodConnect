const cartModel = require('../models/cartModel');
const foodModel = require('../models/foodModel');

exports.addItem = async (req, res, next) => {
  try {
    const { foodId, qty } = req.body;
    const food = await foodModel.getFoodById(foodId);
    if (!food) {
      return res.status(404).json({ status: 'error', message: 'Food not found' });
    }

    const cart = await cartModel.addOrUpdateCartItem({
      userId: req.user.id,
      foodId,
      qty
    });

    return res.status(201).json({
      status: 'success',
      message: 'Item added to cart',
      cart
    });
  } catch (error) {
    return next(error);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const cart = await cartModel.getCartByUser(req.user.id);
    return res.json({ status: 'success', cart });
  } catch (error) {
    return next(error);
  }
};

exports.removeItem = async (req, res, next) => {
  try {
    const removed = await cartModel.removeCartItem({
      userId: req.user.id,
      foodId: Number(req.params.foodId)
    });

    if (!removed) {
      return res.status(404).json({ status: 'error', message: 'Cart item not found' });
    }

    return res.json({
      status: 'success',
      message: 'Item removed from cart'
    });
  } catch (error) {
    return next(error);
  }
};

