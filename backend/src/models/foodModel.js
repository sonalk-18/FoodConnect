const pool = require('./db');

const getAllFoods = async ({ search, category, minPrice, maxPrice }) => {
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(name LIKE ? OR description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (minPrice) {
    conditions.push('price >= ?');
    params.push(Number(minPrice));
  }

  if (maxPrice) {
    conditions.push('price <= ?');
    params.push(Number(maxPrice));
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `SELECT * FROM foods ${whereClause} ORDER BY created_at DESC`;
  const [rows] = await pool.query(query, params);
  return rows;
};

const getFoodById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM foods WHERE id = ? LIMIT 1', [id]);
  return rows[0];
};

const getFoodsByIds = async (ids = []) => {
  if (!ids.length) return [];
  const placeholders = ids.map(() => '?').join(',');
  const [rows] = await pool.query(
    `SELECT * FROM foods WHERE id IN (${placeholders})`,
    ids
  );
  return rows;
};

const createFood = async ({ name, description, price, category, imageUrl }) => {
  const [result] = await pool.query(
    'INSERT INTO foods (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)',
    [name, description, price, category, imageUrl]
  );
  return { id: result.insertId, name, description, price, category, imageUrl };
};

const updateFood = async (id, { name, description, price, category, imageUrl }) => {
  const fields = [];
  const params = [];

  if (name !== undefined) {
    fields.push('name = ?');
    params.push(name);
  }
  if (description !== undefined) {
    fields.push('description = ?');
    params.push(description);
  }
  if (price !== undefined) {
    fields.push('price = ?');
    params.push(price);
  }
  if (category !== undefined) {
    fields.push('category = ?');
    params.push(category);
  }
  if (imageUrl !== undefined) {
    fields.push('image_url = ?');
    params.push(imageUrl);
  }

  if (!fields.length) return getFoodById(id);

  params.push(id);
  await pool.query(`UPDATE foods SET ${fields.join(', ')} WHERE id = ?`, params);
  return getFoodById(id);
};

const deleteFood = async (id) => {
  await pool.query('DELETE FROM foods WHERE id = ?', [id]);
};

module.exports = {
  getAllFoods,
  getFoodById,
  getFoodsByIds,
  createFood,
  updateFood,
  deleteFood
};

