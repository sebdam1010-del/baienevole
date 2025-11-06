const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const { requireAuth, isAdmin } = require('../middleware/auth');

// Public routes (read-only)
router.get('/', eventsController.getAllEvents);
router.get('/:id', eventsController.getEventById);

// Protected routes (admin only)
router.post('/', requireAuth, isAdmin, eventsController.createEvent);
router.put('/:id', requireAuth, isAdmin, eventsController.updateEvent);
router.delete('/:id', requireAuth, isAdmin, eventsController.deleteEvent);

module.exports = router;
