const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// GET /api/saved/colleges
router.get('/colleges', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*,
         (SELECT avg_package FROM placements WHERE college_id=c.id ORDER BY year DESC LIMIT 1) as avg_package,
         (SELECT placement_pct FROM placements WHERE college_id=c.id ORDER BY year DESC LIMIT 1) as placement_pct,
         sc.created_at as saved_at
       FROM saved_colleges sc
       JOIN colleges c ON sc.college_id=c.id
       WHERE sc.user_id=$1
       ORDER BY sc.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/saved/colleges
router.post('/colleges', authMiddleware, async (req, res) => {
  try {
    const { college_id } = req.body;
    if (!college_id) return res.status(400).json({ error: 'college_id required' });
    await db.query(
      'INSERT INTO saved_colleges (user_id, college_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [req.user.id, college_id]
    );
    res.status(201).json({ message: 'College saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/saved/colleges/:college_id
router.delete('/colleges/:college_id', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM saved_colleges WHERE user_id=$1 AND college_id=$2', [
      req.user.id,
      req.params.college_id,
    ]);
    res.json({ message: 'College unsaved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/saved/colleges/ids — just the IDs for quick lookup
router.get('/colleges/ids', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT college_id FROM saved_colleges WHERE user_id=$1', [req.user.id]);
    res.json(result.rows.map((r) => r.college_id));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/saved/comparisons
router.get('/comparisons', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM saved_comparisons WHERE user_id=$1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/saved/comparisons
router.post('/comparisons', authMiddleware, async (req, res) => {
  try {
    const { college_ids, name } = req.body;
    if (!college_ids || !Array.isArray(college_ids))
      return res.status(400).json({ error: 'college_ids array required' });
    const result = await db.query(
      'INSERT INTO saved_comparisons (user_id, college_ids, name) VALUES ($1,$2,$3) RETURNING *',
      [req.user.id, college_ids, name || 'My Comparison']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/saved/comparisons/:id
router.delete('/comparisons/:id', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM saved_comparisons WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Comparison deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
