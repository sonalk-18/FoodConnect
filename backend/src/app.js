const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const pool = require('./models/db');
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const cartRoutes = require('./routes/cartRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const donationRoutes = require('./routes/donationRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const gameRoutes = require('./routes/gameRoutes');
const pointsRoutes = require('./routes/pointsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
const frontendDir =
  process.env.FRONTEND_DIR || path.join(__dirname, '..', '..', 'frontend', 'public');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          'data:',
          'https://i.ibb.co',
          'https://images.unsplash.com',
          'https://*.ibb.co',
          'https://*.unsplash.com'
        ],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, or same-origin requests)
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        allowedOrigin,
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173'
      ];
      if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all for development
      }
    },
    credentials: true
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(express.static(frontendDir));

app.get('/health', async (req, res) => {
  try {
    const [data] = await pool.query('SELECT NOW() AS time');
    res.json({ status: 'ok', time: data[0].time });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/upload', uploadRoutes);

app.use(errorHandler);

module.exports = app;

