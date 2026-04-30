const express = require('express');
const db = require('../db');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// GET /api/questions?college_id=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const { college_id, page = 1, limit = 20 } = req.query;
    let where = '';
    const params = [];
    if (college_id) {
      where = 'WHERE q.college_id=$1';
      params.push(parseInt(college_id));
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const countResult = await db.query(`SELECT COUNT(*) FROM questions q ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    const questions = await db.query(
      `SELECT q.*, c.name as college_name,
         (SELECT COUNT(*) FROM answers a WHERE a.question_id=q.id) as answer_count
       FROM questions q
       LEFT JOIN colleges c ON q.college_id=c.id
       ${where}
       ORDER BY q.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, parseInt(limit), offset]
    );

    res.json({ questions: questions.rows, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/questions/:id — question + answers
router.get('/:id', async (req, res) => {
  try {
    const qResult = await db.query(
      `SELECT q.*, c.name as college_name FROM questions q
       LEFT JOIN colleges c ON q.college_id=c.id WHERE q.id=$1`,
      [req.params.id]
    );
    if (!qResult.rows.length) return res.status(404).json({ error: 'Question not found' });

    const answers = await db.query(
      'SELECT * FROM answers WHERE question_id=$1 ORDER BY created_at ASC',
      [req.params.id]
    );
    res.json({ ...qResult.rows[0], answers: answers.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/questions — ask a question
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { college_id, title, body } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    const result = await db.query(
      'INSERT INTO questions (college_id, user_id, author_name, title, body) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [college_id || null, req.user.id, req.user.name, title, body]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/questions/:id/answers — answer a question
router.post('/:id/answers', authMiddleware, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ error: 'Answer body required' });
    const result = await db.query(
      'INSERT INTO answers (question_id, user_id, author_name, body) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.params.id, req.user.id, req.user.name, body]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
