const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { requireAuth, isAdmin } = require('../middleware/auth');

// Volunteers list route (admin only)
router.get('/', requireAuth, isAdmin, profileController.getVolunteers);

module.exports = router;
