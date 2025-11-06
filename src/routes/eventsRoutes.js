const express = require('express');
const router = express.Router();
const multer = require('multer');
const eventsController = require('../controllers/eventsController');
const { requireAuth, isAdmin } = require('../middleware/auth');

// Configure multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only CSV files
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// Public routes (read-only)
router.get('/', eventsController.getAllEvents);
router.get('/:id', eventsController.getEventById);

// Protected routes (admin only)
router.post('/', requireAuth, isAdmin, eventsController.createEvent);
router.post('/import', requireAuth, isAdmin, upload.single('file'), eventsController.importEvents);
router.put('/:id', requireAuth, isAdmin, eventsController.updateEvent);
router.delete('/:id', requireAuth, isAdmin, eventsController.deleteEvent);

module.exports = router;
