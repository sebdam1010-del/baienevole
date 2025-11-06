const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

/**
 * @swagger
 * /api/dashboard/my-events:
 *   get:
 *     summary: Tous mes événements (passés et à venir)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des événements où je suis inscrit
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       401:
 *         description: Non authentifié
 */
router.get('/my-events', requireAuth, dashboardController.getMyEvents);

/**
 * @swagger
 * /api/dashboard/upcoming:
 *   get:
 *     summary: Mes événements à venir
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des événements à venir où je suis inscrit
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       401:
 *         description: Non authentifié
 */
router.get('/upcoming', requireAuth, dashboardController.getUpcomingEvents);

/**
 * @swagger
 * /api/dashboard/history:
 *   get:
 *     summary: Historique de mes événements passés
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des événements passés où j'ai participé
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       401:
 *         description: Non authentifié
 */
router.get('/history', requireAuth, dashboardController.getHistory);

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Statistiques du bénévole
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques de participation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalEvents:
 *                   type: integer
 *                   description: Nombre total d'événements auxquels je participe
 *                   example: 15
 *                 upcomingEvents:
 *                   type: integer
 *                   description: Nombre d'événements à venir
 *                   example: 3
 *                 totalHours:
 *                   type: number
 *                   format: float
 *                   description: Nombre total d'heures de bénévolat
 *                   example: 45.5
 *       401:
 *         description: Non authentifié
 */
router.get('/stats', requireAuth, dashboardController.getStats);

module.exports = router;
