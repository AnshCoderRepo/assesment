const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');

const app = express();

// ✅ CORS (allow both local + deployed frontend)
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL // e.g. https://
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS blocked"));
    }
  },
  credentials: true
}));

app.use(express.json());

// ✅ Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ✅ Root route
app.get('/', (req, res) => {
  res.send('API is running 🚀');
});

// ✅ Test DB
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Colleges API (MAIN FIX)
app.get('/api/colleges', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM colleges');
    res.json(result.rows); // MUST be array
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date()
  });
});

// ❌ 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.url} not found`
  });
});

// ❌ Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});