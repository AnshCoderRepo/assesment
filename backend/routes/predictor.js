const express = require('express');
const db = require('../db');
const router = express.Router();

/**
 * Rank-based predictor: maps exam + rank to eligible colleges from DB
 * Logic:
 *  JEE Advanced  → IIT, IIIT tier
 *  JEE Main      → NIT, IIIT, Deemed tier
 *  CAT           → MBA (percentile-based)
 *  NEET          → Medical tier
 *  GATE          → M.Tech tier (PG)
 */

const examRules = {
  'JEE Advanced': [
    { rank_max: 100,   types: ['IIT'],                    min_rating: 4.5 },
    { rank_max: 500,   types: ['IIT'],                    min_rating: 4.2 },
    { rank_max: 2000,  types: ['IIT', 'IIIT'],            min_rating: 3.8 },
    { rank_max: 5000,  types: ['IIT', 'NIT', 'IIIT'],    min_rating: 3.5 },
    { rank_max: 15000, types: ['NIT', 'IIIT', 'Deemed'],  min_rating: 3.2 },
    { rank_max: 999999,types: ['NIT', 'Deemed', 'Private'],min_rating: 3.0 },
  ],
  'JEE Main': [
    { rank_max: 1000,  types: ['NIT', 'IIIT'],            min_rating: 4.0 },
    { rank_max: 5000,  types: ['NIT', 'IIIT'],            min_rating: 3.7 },
    { rank_max: 20000, types: ['NIT', 'Deemed', 'IIIT'],  min_rating: 3.4 },
    { rank_max: 80000, types: ['Deemed', 'Private'],      min_rating: 3.2 },
    { rank_max: 999999,types: ['Private'],                min_rating: 3.0 },
  ],
  'CAT': [
    // rank field treated as percentile for CAT
    { rank_max: 5,   types: ['MBA', 'Deemed', 'Private'], min_rating: 4.5 },
    { rank_max: 10,  types: ['Deemed', 'Private'],        min_rating: 4.0 },
    { rank_max: 20,  types: ['Private', 'Deemed'],        min_rating: 3.7 },
    { rank_max: 999999, types: ['Private'],               min_rating: 3.0 },
  ],
  'NEET': [
    { rank_max: 1000,  types: ['Government', 'Deemed'],   min_rating: 4.0 },
    { rank_max: 10000, types: ['Deemed', 'Private'],      min_rating: 3.5 },
    { rank_max: 999999,types: ['Private'],                min_rating: 3.0 },
  ],
  'GATE': [
    { rank_max: 100,   types: ['IIT', 'NIT'],             min_rating: 4.5 },
    { rank_max: 500,   types: ['IIT', 'NIT', 'IIIT'],    min_rating: 4.0 },
    { rank_max: 2000,  types: ['NIT', 'Deemed'],          min_rating: 3.5 },
    { rank_max: 999999,types: ['Deemed', 'Private'],      min_rating: 3.0 },
  ],
};

// POST /api/predict
router.post('/', async (req, res) => {
  try {
    const { exam, rank } = req.body;
    if (!exam || rank === undefined || rank === null)
      return res.status(400).json({ error: 'exam and rank are required' });

    const rules = examRules[exam];
    if (!rules)
      return res.status(400).json({
        error: `Unsupported exam. Supported: ${Object.keys(examRules).join(', ')}`,
      });

    // Find applicable rule
    const numRank = parseFloat(rank);
    const applicableRule = rules.find((r) => numRank <= r.rank_max);
    if (!applicableRule) {
      return res.json({ colleges: [], message: 'No colleges found for given rank' });
    }

    const typePlaceholders = applicableRule.types.map((_, i) => `$${i + 1}`).join(',');
    const result = await db.query(
      `SELECT c.*,
         (SELECT avg_package FROM placements WHERE college_id=c.id ORDER BY year DESC LIMIT 1) as avg_package,
         (SELECT placement_pct FROM placements WHERE college_id=c.id ORDER BY year DESC LIMIT 1) as placement_pct
       FROM colleges c
       WHERE c.type IN (${typePlaceholders}) AND c.rating >= $${applicableRule.types.length + 1}
       ORDER BY c.rating DESC, c.nirf_rank ASC NULLS LAST
       LIMIT 10`,
      [...applicableRule.types, applicableRule.min_rating]
    );

    res.json({
      exam,
      rank: numRank,
      rule: applicableRule,
      colleges: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/predict/exams — list supported exams
router.get('/exams', (req, res) => {
  res.json(Object.keys(examRules));
});

module.exports = router;
