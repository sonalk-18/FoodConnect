const pool = require('./db');

const mapRow = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  url: row.url,
  iconUrl: row.icon_url,
  pointsPerPlay: row.points_per_play,
  tags: row.tags ? row.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
  isActive: !!row.is_active
});

const getGames = async ({ includeInactive = false } = {}) => {
  const clause = includeInactive ? '' : 'WHERE is_active = 1';
  const [rows] = await pool.query(`SELECT * FROM games ${clause} ORDER BY created_at DESC`);
  return rows.map(mapRow);
};

const getGameById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM games WHERE id = ? LIMIT 1', [id]);
  return rows[0] ? mapRow(rows[0]) : null;
};

const createGame = async ({ title, description, url, iconUrl, pointsPerPlay, tags = '' }) => {
  const [result] = await pool.query(
    `INSERT INTO games (title, description, url, icon_url, points_per_play, tags, is_active)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [title, description || null, url, iconUrl || null, pointsPerPlay, Array.isArray(tags) ? tags.join(',') : tags]
  );
  return getGameById(result.insertId);
};

const updateGame = async (id, { title, description, url, iconUrl, pointsPerPlay, tags, isActive }) => {
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
  if (url !== undefined) {
    fields.push('url = ?');
    params.push(url);
  }
  if (iconUrl !== undefined) {
    fields.push('icon_url = ?');
    params.push(iconUrl);
  }
  if (pointsPerPlay !== undefined) {
    fields.push('points_per_play = ?');
    params.push(pointsPerPlay);
  }
  if (tags !== undefined) {
    fields.push('tags = ?');
    params.push(Array.isArray(tags) ? tags.join(',') : tags);
  }
  if (isActive !== undefined) {
    fields.push('is_active = ?');
    params.push(isActive ? 1 : 0);
  }

  if (!fields.length) {
    return getGameById(id);
  }

  params.push(id);
  await pool.query(`UPDATE games SET ${fields.join(', ')} WHERE id = ?`, params);
  return getGameById(id);
};

const deleteGame = async (id) => {
  await pool.query('DELETE FROM games WHERE id = ?', [id]);
};

module.exports = {
  getGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame
};

