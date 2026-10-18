const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '8mb' }));

// Base Health Check Route
app.get('/', (req, res) => {
  res.send('JobNest API is running...');
});

// Mounting Feature Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

const PORT = process.env.PORT || 5000;

// Do not accept API requests until MongoDB is available. This prevents
// registration requests from hanging in Mongoose's query buffer at startup.
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`JobNest Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error('Unable to start API because MongoDB is unavailable:', error.message);
    process.exit(1);
  });
