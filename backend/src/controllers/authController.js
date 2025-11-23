const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

const ACCESS_TOKEN_TTL = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

// Token builder
const buildTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL
  });

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  );

  return { token, refreshToken };
};

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  points: user.points
});

// SIGNUP
exports.signup = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(400).json({ status: 'error', message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await userModel.createUser({
      name,
      email,
      password: hashedPassword,
      role
    });

    const tokens = buildTokens(user);

    return res.status(201).json({
      status: 'success',
      message: 'Account created successfully',
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(400).json({ status: 'error', message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: 'error', message: 'Invalid credentials' });
    }

    const tokens = buildTokens(user);
    return res.json({
      status: 'success',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        points: user.points
      },
      token: tokens.token,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    next(error);
  }
};

// REFRESH TOKEN
exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(400).json({ status: 'error', message: 'Refresh token missing' });

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    const tokens = buildTokens(decoded);
    return res.json(tokens);
  } catch (e) {
    return res.status(401).json({ status: 'error', message: 'Invalid refresh token' });
  }
};

// PROFILE (GET /me)
exports.getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    return res.json({
      status: 'success',
      user: sanitizeUser(user)
    });
  } catch (e) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};
