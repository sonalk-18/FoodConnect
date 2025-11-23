const pool = require('./db');

const mapRow = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  image: row.image,
  pointsRequired: row.points_required,
  inventory: row.inventory,
  isActive: !!row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const getRewards = async () => {
  const [rows] = await pool.query('SELECT * FROM rewards ORDER BY points_required ASC');
  return rows.map(mapRow);
};

const getRewardById = async (id, db = pool) => {
  const executor = db.query ? db : pool;
  const [rows] = await executor.query('SELECT * FROM rewards WHERE id = ? LIMIT 1', [id]);
  return rows[0] ? mapRow(rows[0]) : null;
};

const createReward = async ({ title, description, image, pointsRequired, inventory = 0, isActive = true }) => {
  const [result] = await pool.query(
    `INSERT INTO rewards (title, description, image, points_required, inventory, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, description || null, image || null, pointsRequired, inventory, isActive ? 1 : 0]
  );
  return getRewardById(result.insertId);
};

const updateReward = async (id, { title, description, image, pointsRequired, inventory, isActive }) => {
  const fields = [];
  const params = [];
  if (title !== undefined) {
    fields.push('title = ?');
    params.push(title);
  }
  if (description !== undefined) {
    fields.push('description = ?');
    params.push(description);
  }
  if (image !== undefined) {
    fields.push('image = ?');
    params.push(image);
  }
  if (pointsRequired !== undefined) {
    fields.push('points_required = ?');
    params.push(pointsRequired);
  }
  if (inventory !== undefined) {
    fields.push('inventory = ?');
    params.push(inventory);
  }
  if (isActive !== undefined) {
    fields.push('is_active = ?');
    params.push(isActive ? 1 : 0);
  }

  if (!fields.length) {
    return getRewardById(id);
  }

  params.push(id);
  await pool.query(`UPDATE rewards SET ${fields.join(', ')} WHERE id = ?`, params);
  return getRewardById(id);
};

const deleteReward = async (id) => {
  await pool.query('DELETE FROM rewards WHERE id = ?', [id]);
};

const decrementInventory = async (id, db) => {
  const executor = db || pool;
  const [result] = await executor.query(
    'UPDATE rewards SET inventory = inventory - 1 WHERE id = ? AND inventory > 0',
    [id]
  );
  if (result.affectedRows === 0) {
    const error = new Error('Reward is out of stock');
    error.status = 400;
    throw error;
  }
};

module.exports = {
  getRewards,
  getRewardById,
  createReward,
  updateReward,
  deleteReward,
  decrementInventory
};

