const express = require('express');
const router = express.Router();

const getResults = require('../controllers/results');

// Routes available
router.get('/', getResults);

// Catch all non-existing routes
router.route('*').all((req, res) => {
  return res.status(404).json({ error: 'This route does not exist.' });
});

module.exports = router;
