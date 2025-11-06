const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { requireAuth, isAdmin } = require('../middleware/auth');

/**
 * @swagger
 * /api/volunteers:
 *   get:
 *     summary: Liste de tous les bénévoles (admin)
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste complète des bénévoles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Accès refusé (admin requis)
 *       401:
 *         description: Non authentifié
 */
router.get('/', requireAuth, isAdmin, profileController.getVolunteers);

module.exports = router;
