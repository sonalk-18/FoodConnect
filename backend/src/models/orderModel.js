const pool = require('./db');

/*
  IMPORTANT:
  Controller already does JSON.stringify(items)
  So model must store items DIRECTLY without another stringify.
*/


// ---------------------------
// Create Order (Receiver)
// ---------------------------
const createOrder = async ({ userId, items, total, status = 'placed' }) => {
  // items are already JSON.stringify() in controller
  const [result] = await pool.query(
    `INSERT INTO orders (user_id, items, total, status)
     VALUES (?, ?, ?, ?)`,
    [userId, items, total, status]
  );

  return {
    id: result.insertId,
    userId,
    items: JSON.parse(items), // return parsed items
    total,
    status
  };
};


// -----------------------------------------------
// Get ALL orders (Donor dashboard)
// -----------------------------------------------
const getOrders = async () => {
  const [rows] = await pool.query(
    `SELECT 
        o.*, 
        u.name AS customer_name, 
        u.email AS customer_email
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC`
  );

  return rows.map((row) => ({
    ...row,
    items:
      typeof row.items === 'string'
        ? JSON.parse(row.items)
        : row.items || []
  }));
};


// -----------------------------------------------
// Get ALL orders of the logged-in user (Receiver)
// -----------------------------------------------
const getOrdersByUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT * 
     FROM orders 
     WHERE user_id = ? 
     ORDER BY created_at DESC`,
    [userId]
  );

  return rows.map((row) => ({
    ...row,
    items:
      typeof row.items === 'string'
        ? JSON.parse(row.items)
        : row.items || []
  }));
};


// -----------------------------------------------
// Update Order Status (Donor)
// -----------------------------------------------
const updateOrderStatus = async (orderId, status) => {
  const [result] = await pool.query(
    `UPDATE orders SET status = ? WHERE id = ?`,
    [status, orderId]
  );

  if (result.affectedRows === 0) return null;

  // Fetch updated order with user info
  const [rows] = await pool.query(
    `SELECT 
        o.*, 
        u.name AS customer_name, 
        u.email AS customer_email
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     WHERE o.id = ?`,
    [orderId]
  );

  if (rows.length === 0) return null;

  const row = rows[0];

  return {
    ...row,
    items:
      typeof row.items === 'string'
        ? JSON.parse(row.items)
        : row.items || []
  };
};


module.exports = {
  createOrder,
  getOrders,
  getOrdersByUser,
  updateOrderStatus
};
