const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

// Dashboard routes (authenticated volunteers)
router.get('/my-events', requireAuth, dashboardController.getMyEvents);
router.get('/upcoming', requireAuth, dashboardController.getUpcomingEvents);
router.get('/history', requireAuth, dashboardController.getHistory);
router.get('/stats', requireAuth, dashboardController.getStats);

module.exports = router;
