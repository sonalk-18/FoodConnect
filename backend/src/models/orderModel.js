const pool = require('./db');

const createOrder = async ({ userId, items, total, status = 'placed' }) => {
  const [result] = await pool.query(
    'INSERT INTO orders (user_id, items, total, status) VALUES (?, ?, ?, ?)',
    [userId, JSON.stringify(items), total, status]
  );
  return {
    id: result.insertId,
    userId,
    items,
    total,
    status
  };
};

const getOrders = async () => {
  const [rows] = await pool.query(
    `SELECT o.*, u.name AS customer_name, u.email AS customer_email
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC`
  );
  return rows.map((row) => ({
    ...row,
    items: JSON.parse(row.items || '[]')
  }));
};

const getOrdersByUser = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows.map((row) => ({
    ...row,
    items: JSON.parse(row.items || '[]')
  }));
};

const updateOrderStatus = async (orderId, status) => {
  const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [
    status,
    orderId
  ]);
  return result.affectedRows > 0;
};

module.exports = {
  createOrder,
  getOrders,
  getOrdersByUser,
  updateOrderStatus
};

