const orderModel = require('../models/orderModel');
const foodModel = require('../models/foodModel');
const cartModel = require('../models/cartModel');


// ----------------------
// Create Order (Receiver)
// ----------------------
exports.createOrder = async (req, res, next) => {
  try {
    const { items } = req.body;

    // Validate input structure
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Items must be a non-empty array',
      });
    }

    const uniqueFoodIds = [...new Set(items.map((item) => item.foodId))];
    const foods = await foodModel.getFoodsByIds(uniqueFoodIds);

    if (foods.length !== uniqueFoodIds.length) {
      return res.status(400).json({
        status: 'error',
        message: 'One or more food items are invalid',
      });
    }

    // Prepare order item details
    const foodMap = new Map(foods.map((food) => [food.id, food]));
    const orderItems = items.map((item) => {
      const food = foodMap.get(item.foodId);
      const price = Number(food.price);

      return {
        foodId: food.id,
        name: food.name,
        price,
        qty: item.qty,
        lineTotal: price * item.qty
      };
    });

    // Calculate total
    const total = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);

    // IMPORTANT FIX: Convert items to JSON string
    const order = await orderModel.createOrder({
      userId: req.user.id,
      items: JSON.stringify(orderItems),  // ← FIXED
      total,
      status: 'placed'
    });

    return res.status(201).json({
      status: 'success',
      message: 'Order placed successfully',
      orderId: order.id,
      orderStatus: order.status,
      total,
      items: orderItems
    });

  } catch (error) {
    return next(error);
  }
};


// -------------------------------------------
// Get all orders (Donor dashboard) – all users
// -------------------------------------------
exports.getOrders = async (_req, res, next) => {
  try {
    const orders = await orderModel.getOrders();

    // Parse JSON safely
    const parsedOrders = orders.map((order) => ({
      ...order,
      items: typeof order.items === 'string'
        ? JSON.parse(order.items)
        : order.items
    }));

    return res.json({
      status: 'success',
      orders: parsedOrders,
      message: 'All food requests from receivers'
    });

  } catch (error) {
    return next(error);
  }
};


// ----------------------------------------
// Get logged-in user's orders (Receiver)
// ----------------------------------------
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderModel.getOrdersByUser(req.user.id);

    const parsedOrders = orders.map((order) => ({
      ...order,
      items: typeof order.items === 'string'
        ? JSON.parse(order.items)
        : order.items
    }));

    return res.json({
      status: 'success',
      orders: parsedOrders
    });

  } catch (error) {
    return next(error);
  }
};


// ----------------------------------------
// Update Order Status (Donor side)
// ----------------------------------------
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const updated = await orderModel.updateOrderStatus(
      req.params.id,
      req.body.status
    );

    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    return res.json({
      status: 'success',
      message: 'Food request status updated successfully',
      order: updated,
      orderId: Number(req.params.id),
      orderStatus: req.body.status
    });

  } catch (error) {
    return next(error);
  }
};
