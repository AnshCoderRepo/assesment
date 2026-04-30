const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/compare?ids=1,2,3
router.get('/', async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.status(400).json({ error: 'ids query param required' });

    const idList = ids.split(',').map((id) => parseInt(id.trim())).filter(Boolean);
    if (idList.length < 2 || idList.length > 3)
      return res.status(400).json({ error: 'Provide 2 or 3 college IDs' });

    const placeholders = idList.map((_, i) => `$${i + 1}`).join(',');
    const collegeResult = await db.query(
      `SELECT c.*,
        (SELECT avg_package FROM placements WHERE college_id = c.id ORDER BY year DESC LIMIT 1) as avg_package,
        (SELECT highest_package FROM placements WHERE college_id = c.id ORDER BY year DESC LIMIT 1) as highest_package,
        (SELECT placement_pct FROM placements WHERE college_id = c.id ORDER BY year DESC LIMIT 1) as placement_pct
       FROM colleges c WHERE c.id IN (${placeholders})`,
      idList
    );

    if (!collegeResult.rows.length) return res.status(404).json({ error: 'No colleges found' });

    // Fetch courses for each college
    const coursesResult = await db.query(
      `SELECT * FROM courses WHERE college_id IN (${placeholders}) ORDER BY level, name`,
      idList
    );

    const coursesByCollege = {};
    coursesResult.rows.forEach((c) => {
      if (!coursesByCollege[c.college_id]) coursesByCollege[c.college_id] = [];
      coursesByCollege[c.college_id].push(c.name);
    });

    const colleges = collegeResult.rows.map((c) => ({
      ...c,
      courses: coursesByCollege[c.id] || [],
    }));

    // Preserve requested order
    const ordered = idList.map((id) => colleges.find((c) => c.id === id)).filter(Boolean);

    res.json(ordered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
