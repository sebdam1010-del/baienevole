const express = require('express');
const router = express.Router();
const { requireAuth, isAdmin } = require('../middleware/auth');

// Test route for admin access
router.get('/test', requireAuth, isAdmin, (req, res) => {
  res.status(200).json({
    message: 'Admin access granted',
    user: req.user,
  });
});

module.exports = router;
