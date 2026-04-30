const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/colleges', require('./routes/colleges'));
app.use('/api/compare', require('./routes/compare'));
app.use('/api/predict', require('./routes/predictor'));
app.use('/api/questions', require('./routes/qa'));
app.use('/api/saved', require('./routes/saved'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const db = require('./db');

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 CollegeCompass API running on http://localhost:${PORT}`);
  
  // Verify database connection
  try {
    await db.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error('❌ Database connection failed:');
    console.error(err.message);
  }
});