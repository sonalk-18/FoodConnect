const pool = require('./db');

// Allowed roles
// 'receiver' = Default role for general users (can browse, order, donate, etc.)
// 'donor' = Admin-level role with elevated permissions (can manage system)
const ALLOWED_ROLES = ['donor', 'receiver'];

// Base fields (NO PASSWORD included here)
const baseSelect = 'id, name, email, phone, role, points, created_at';

// FIND USER BY EMAIL (for login)
const findByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT ${baseSelect}, password FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0];
};

// FIND USER BY ID (for profile)
const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT ${baseSelect} FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0];
};

// CREATE USER (role must be donor/receiver)
const createUser = async ({ name, email, phone = null, password, role }) => {
  // Hard validation for backend safety
  if (!ALLOWED_ROLES.includes(role)) {
    throw new Error("Invalid role. Role must be 'donor' or 'receiver'.");
  }

  const [result] = await pool.query(
    `INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`,
    [name, email, phone, password, role]
  );

  return {
    id: result.insertId,
    name,
    email,
    phone,
    role,
    points: 0
  };
};

// GET ALL USERS
const getAllUsers = async () => {
  const [rows] = await pool.query(`SELECT ${baseSelect} FROM users ORDER BY created_at DESC`);
  return rows;
};

// UPDATE USER ROLE
const updateUserRole = async (id, role) => {
  if (!ALLOWED_ROLES.includes(role)) {
    throw new Error("Invalid role. Role must be 'donor' or 'receiver'.");
  }

  const [result] = await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
  if (!result.affectedRows) return null;

  return findById(id);
};

module.exports = {
  findByEmail,
  findById,
  createUser,
  getAllUsers,
  updateUserRole
};
