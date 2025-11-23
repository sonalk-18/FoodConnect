const pool = require('./db');

const STATUS_ENUM = ['pending', 'in_review', 'approved', 'rejected'];

const createPartnerApplication = async ({
  userId,
  organizationName,
  organizationType,
  contactPerson,
  email,
  phone,
  location,
  website,
  message,
  documentUrl
}) => {
  const [result] = await pool.query(
    `INSERT INTO partners
      (user_id, organization_name, organization_type, contact_person, email, phone, location, website, message, document_url, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      userId,
      organizationName,
      organizationType,
      contactPerson,
      email,
      phone,
      location,
      website || null,
      message || null,
      documentUrl || null
    ]
  );
  return getPartnerById(result.insertId);
};

const getPartnerById = async (id) => {
  const [rows] = await pool.query(
    `SELECT p.*, u.name AS user_name, u.email AS user_email
     FROM partners p
     LEFT JOIN users u ON u.id = p.user_id
     WHERE p.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0];
};

const getPartners = async ({ status } = {}) => {
  const params = [];
  let where = '';
  if (status && STATUS_ENUM.includes(status)) {
    where = 'WHERE p.status = ?';
    params.push(status);
  }
  const [rows] = await pool.query(
    `SELECT p.*, u.name AS user_name, u.email AS user_email
     FROM partners p
     LEFT JOIN users u ON u.id = p.user_id
     ${where}
     ORDER BY p.created_at DESC`,
    params
  );
  return rows;
};

const getPartnersByUser = async (userId) => {
  const [rows] = await pool.query('SELECT * FROM partners WHERE user_id = ? ORDER BY created_at DESC', [
    userId
  ]);
  return rows;
};

const updatePartnerStatus = async (partnerId, status, notes) => {
  if (!STATUS_ENUM.includes(status)) {
    throw new Error('Invalid status value');
  }
  await pool.query('UPDATE partners SET status = ?, notes = ? WHERE id = ?', [
    status,
    notes || null,
    partnerId
  ]);
  return getPartnerById(partnerId);
};

module.exports = {
  STATUS_ENUM,
  createPartnerApplication,
  getPartnerById,
  getPartners,
  getPartnersByUser,
  updatePartnerStatus
};

