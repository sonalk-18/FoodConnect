const pool = require('./db');

const getCartByUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
      c.food_id AS foodId,
      c.qty,
      f.name,
      f.price,
      f.image_url AS imageUrl
    FROM cart c
    INNER JOIN foods f ON f.id = c.food_id
    WHERE c.user_id = ?
    ORDER BY c.id DESC`,
    [userId]
  );
  return rows;
};

const addOrUpdateCartItem = async ({ userId, foodId, qty }) => {
  const [existing] = await pool.query(
    'SELECT id FROM cart WHERE user_id = ? AND food_id = ? LIMIT 1',
    [userId, foodId]
  );

  if (existing.length) {
    await pool.query('UPDATE cart SET qty = ? WHERE id = ?', [qty, existing[0].id]);
  } else {
    await pool.query('INSERT INTO cart (user_id, food_id, qty) VALUES (?, ?, ?)', [
      userId,
      foodId,
      qty
    ]);
  }

  return getCartByUser(userId);
};

const removeCartItem = async ({ userId, foodId }) => {
  const [result] = await pool.query('DELETE FROM cart WHERE user_id = ? AND food_id = ?', [
    userId,
    foodId
  ]);
  return result.affectedRows > 0;
};

const removeManyCartItems = async ({ userId, foodIds }) => {
  if (!Array.isArray(foodIds) || !foodIds.length) return;
  const placeholders = foodIds.map(() => '?').join(',');
  await pool.query(
    `DELETE FROM cart WHERE user_id = ? AND food_id IN (${placeholders})`,
    [userId, ...foodIds]
  );
};

module.exports = {
  getCartByUser,
  addOrUpdateCartItem,
  removeCartItem,
  removeManyCartItems
};

