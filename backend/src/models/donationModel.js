const pool = require('./db');

const STATUS_ENUM = ['pending', 'scheduled', 'picked_up', 'completed', 'cancelled'];

const normalizeStatus = (status = 'pending') =>
  STATUS_ENUM.includes(status) ? status : 'pending';

const createDonation = async ({
  userId,
  donorType,
  contactName,
  contactPhone,
  contactEmail,
  foodType,
  quantity,
  pickupAddress,
  pickupWindow,
  notes
}) => {
  const status = 'pending';
  const [result] = await pool.query(
    `INSERT INTO donations
      (user_id, donor_type, contact_name, contact_phone, contact_email, food_type, quantity, pickup_address, pickup_window, notes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      donorType,
      contactName,
      contactPhone,
      contactEmail,
      foodType,
      quantity,
      pickupAddress,
      pickupWindow,
      notes || null,
      status
    ]
  );
  return getDonationById(result.insertId);
};

const getDonationById = async (id) => {
  const [rows] = await pool.query(
    `SELECT d.*, u.name AS user_name, u.email AS user_email
     FROM donations d
     LEFT JOIN users u ON u.id = d.user_id
     WHERE d.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0];
};

const getDonations = async ({ status } = {}) => {
  const params = [];
  let whereClause = '';
  if (status && STATUS_ENUM.includes(status)) {
    whereClause = 'WHERE d.status = ?';
    params.push(status);
  }
  const [rows] = await pool.query(
    `SELECT d.*, u.name AS user_name, u.email AS user_email
     FROM donations d
     LEFT JOIN users u ON u.id = d.user_id
     ${whereClause}
     ORDER BY d.created_at DESC`,
    params
  );
  return rows;
};

const getDonationsByUser = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM donations WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
};

const updateDonationStatus = async (donationId, status, assignedVolunteer) => {
  const normalized = normalizeStatus(status);
  await pool.query(
    'UPDATE donations SET status = ?, assigned_volunteer = ? WHERE id = ?',
    [normalized, assignedVolunteer || null, donationId]
  );
  return getDonationById(donationId);
};

module.exports = {
  STATUS_ENUM,
  createDonation,
  getDonationById,
  getDonations,
  getDonationsByUser,
  updateDonationStatus
};

