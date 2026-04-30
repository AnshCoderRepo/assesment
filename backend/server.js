const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();

// 1. CORS CONFIGURATION
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim()) 
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// 2. REQUEST LOGGING
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 3. TEST ROUTES
app.get('/test', (req, res) => res.send('API working'));
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});
app.get('/api/health', (req, res) => res.json({ 
  status: 'ok', 
  timestamp: new Date(),
  env: process.env.NODE_ENV
}));

// 4. API ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/colleges', require('./routes/colleges'));
app.use('/api/compare', require('./routes/compare'));
app.use('/api/predict', require('./routes/predictor'));
app.use('/api/questions', require('./routes/qa'));
app.use('/api/saved', require('./routes/saved'));

// 5. 404 HANDLER
app.use((req, res) => {
  console.warn(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// 6. GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(err.status || 500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 7. SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Allowed Origins: ${allowedOrigins.join(', ')}`);
  
  try {
    await db.query('SELECT NOW()');
    console.log('✅ PostgreSQL Connected');
  } catch (err) {
    console.error('❌ DB Connection Failed:', err.message);
  }
});