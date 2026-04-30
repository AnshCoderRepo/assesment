const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/colleges — search, filter, pagination
router.get('/', async (req, res) => {
  try {
    const { search, state, type, min_fees, max_fees, course, page = 1, limit = 12, sort = 'rating' } = req.query;
    let conditions = [];
    let params = [];
    let idx = 1;

    if (search) {
      conditions.push(`c.name ILIKE $${idx++}`);
      params.push(`%${search}%`);
    }
    if (state) {
      conditions.push(`c.state ILIKE $${idx++}`);
      params.push(`%${state}%`);
    }
    if (type) {
      conditions.push(`c.type = $${idx++}`);
      params.push(type);
    }
    if (min_fees) {
      conditions.push(`c.fees_min >= $${idx++}`);
      params.push(parseInt(min_fees));
    }
    if (max_fees) {
      conditions.push(`c.fees_max <= $${idx++}`);
      params.push(parseInt(max_fees));
    }
    if (course) {
      conditions.push(`EXISTS (SELECT 1 FROM courses co WHERE co.college_id = c.id AND co.name ILIKE $${idx++})`);
      params.push(`%${course}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sortMap = {
      rating: 'c.rating DESC',
      fees_asc: 'c.fees_min ASC',
      fees_desc: 'c.fees_min DESC',
      nirf: 'c.nirf_rank ASC NULLS LAST',
      name: 'c.name ASC',
    };
    const orderBy = sortMap[sort] || 'c.rating DESC';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const countResult = await db.query(`SELECT COUNT(*) FROM colleges c ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    const dataParams = [...params, parseInt(limit), offset];
    const dataResult = await db.query(
      `SELECT c.*,
        (SELECT avg_package FROM placements WHERE college_id = c.id ORDER BY year DESC LIMIT 1) as avg_package,
        (SELECT placement_pct FROM placements WHERE college_id = c.id ORDER BY year DESC LIMIT 1) as placement_pct
       FROM colleges c
       ${where}
       ORDER BY ${orderBy}
       LIMIT $${idx++} OFFSET $${idx++}`,
      dataParams
    );

    res.json({
      colleges: dataResult.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/colleges/:id — full detail
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const collegeResult = await db.query('SELECT * FROM colleges WHERE id=$1', [id]);
    if (!collegeResult.rows.length) return res.status(404).json({ error: 'College not found' });

    const college = collegeResult.rows[0];

    const [courses, placements, reviews] = await Promise.all([
      db.query('SELECT * FROM courses WHERE college_id=$1 ORDER BY level, name', [id]),
      db.query('SELECT * FROM placements WHERE college_id=$1 ORDER BY year DESC', [id]),
      db.query(`SELECT r.*, u.name as user_display_name FROM reviews r
                LEFT JOIN users u ON r.user_id = u.id
                WHERE r.college_id=$1 ORDER BY r.created_at DESC`, [id]),
    ]);

    res.json({
      ...college,
      courses: courses.rows,
      placements: placements.rows,
      reviews: reviews.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/colleges/:id/reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT r.*, u.name as user_display_name FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.college_id=$1 ORDER BY r.created_at DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/colleges/:id/reviews
const { authMiddleware } = require('../middleware/auth');
router.post('/:id/reviews', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, content, pros, cons, batch_year } = req.body;
    if (!rating || !content) return res.status(400).json({ error: 'Rating and content required' });

    const result = await db.query(
      `INSERT INTO reviews (college_id, user_id, reviewer_name, rating, content, pros, cons, batch_year)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [id, req.user.id, req.user.name, rating, content, pros, cons, batch_year]
    );

    // Update college rating
    await db.query(
      'UPDATE colleges SET rating = (SELECT AVG(rating) FROM reviews WHERE college_id=$1) WHERE id=$1',
      [id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET distinct states and types for filter options
router.get('/meta/filters', async (req, res) => {
  try {
    const [states, types] = await Promise.all([
      db.query('SELECT DISTINCT state FROM colleges ORDER BY state'),
      db.query('SELECT DISTINCT type FROM colleges ORDER BY type'),
    ]);
    res.json({ states: states.rows.map((r) => r.state), types: types.rows.map((r) => r.type) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
