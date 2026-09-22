require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./config/db'); // Initialize DB connection test
const { AppError, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      return callback(null, true);
    }
    return callback(new AppError(403, 'CORS_ORIGIN_NOT_ALLOWED', 'Origin tidak diizinkan.'));
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running normally.' });
});

// Register routes
const cardRoutes = require('./routes/cards.routes');
app.use('/api/cards', cardRoutes);

const redirectRoutes = require('./routes/redirect.routes');
app.use('/r', redirectRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint tidak ditemukan.'
    }
  });
});

app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
