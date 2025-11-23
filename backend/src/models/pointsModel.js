const pool = require('./db');

const addEntry = async (
  { userId, points, sourceType, sourceId = null, note = null, direction = 'credit' },
  db = pool
) => {
  const executor = db.query ? db : pool;
  const [result] = await executor.query(
    `INSERT INTO user_points (user_id, points, source_type, source_id, note, direction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, points, sourceType, sourceId, note, direction]
  );
  return { id: result.insertId, userId, points, sourceType, sourceId, note, direction };
};

const getHistoryByUser = async (userId, limit = 25) => {
  const [rows] = await pool.query(
    `SELECT * FROM user_points WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
    [userId, limit]
  );
  return rows;
};

module.exports = {
  addEntry,
  getHistoryByUser
};

