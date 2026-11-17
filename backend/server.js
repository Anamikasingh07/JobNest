const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(cors((req, callback) => {
  const origin = req.header('Origin');
  let sameHost = false;
  try {
    sameHost = Boolean(origin) && new URL(origin).host === req.get('host');
  } catch { /* Ignore malformed Origin headers. */ }
  const allowed = !origin || process.env.NODE_ENV !== 'production' || sameHost || allowedOrigins.includes(origin);
  callback(null, { origin: allowed ? origin : false });
}));
app.use(express.json({ limit: '8mb' }));

// Health check for the hosting platform.
app.get('/healthz', (req, res) => {
  res.send('JobNest API is running...');
});

// Mounting Feature Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// In a single-service deployment, serve the Vite build from the API server.
const frontendDist = path.join(__dirname, '..', 'dist');
app.use(express.static(frontendDist));
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  return res.sendFile(path.join(frontendDist, 'index.html'), (error) => {
    if (error) next(error);
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be configured in production.');
  }
  await connectDB();
  app.listen(PORT, () => console.log(`JobNest Server running on port ${PORT}`));
};

startServer();
