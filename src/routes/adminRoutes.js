const express = require('express');
const router = express.Router();
const { requireAuth, isAdmin } = require('../middleware/auth');
const eventsController = require('../controllers/eventsController');

// Test route for admin access
router.get('/test', requireAuth, isAdmin, (req, res) => {
  res.status(200).json({
    message: 'Admin access granted',
    user: req.user,
  });
});

// Admin events endpoints with full registration data
router.get('/events', requireAuth, isAdmin, eventsController.getAdminEvents);
router.get('/events/:id/export', requireAuth, isAdmin, eventsController.exportEventRegistrations);
router.delete('/registrations/:id', requireAuth, isAdmin, eventsController.deleteRegistration);

module.exports = router;
