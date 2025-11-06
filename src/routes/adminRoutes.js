const express = require('express');
const router = express.Router();
const { requireAuth, isAdmin } = require('../middleware/auth');
const eventsController = require('../controllers/eventsController');
const scrapeController = require('../controllers/scrapeController');

/**
 * @swagger
 * /api/admin/test:
 *   get:
 *     summary: Tester l'accès admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Accès admin confirmé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Admin access granted
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: Accès refusé (admin requis)
 */
router.get('/test', requireAuth, isAdmin, (req, res) => {
  res.status(200).json({
    message: 'Admin access granted',
    user: req.user,
  });
});

/**
 * @swagger
 * /api/admin/events:
 *   get:
 *     summary: Liste des événements avec détails d'inscription (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: saison
 *         schema:
 *           type: integer
 *         description: Filtrer par saison
 *       - in: query
 *         name: annee
 *         schema:
 *           type: integer
 *         description: Filtrer par année
 *     responses:
 *       200:
 *         description: Liste des événements avec inscriptions complètes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Event'
 *                   - type: object
 *                     properties:
 *                       registrations:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Registration'
 *       403:
 *         description: Accès refusé (admin requis)
 */
router.get('/events', requireAuth, isAdmin, eventsController.getAdminEvents);

/**
 * @swagger
 * /api/admin/events/{id}/export:
 *   get:
 *     summary: Exporter les inscriptions d'un événement en CSV (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'événement
 *     responses:
 *       200:
 *         description: Fichier CSV des inscriptions
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       404:
 *         description: Événement non trouvé
 *       403:
 *         description: Accès refusé (admin requis)
 */
router.get('/events/:id/export', requireAuth, isAdmin, eventsController.exportEventRegistrations);

/**
 * @swagger
 * /api/admin/registrations/{id}:
 *   delete:
 *     summary: Supprimer une inscription (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'inscription
 *     responses:
 *       200:
 *         description: Inscription supprimée
 *       404:
 *         description: Inscription non trouvée
 *       403:
 *         description: Accès refusé (admin requis)
 */
router.delete('/registrations/:id', requireAuth, isAdmin, eventsController.deleteRegistration);

/**
 * @swagger
 * /api/admin/scrape/events:
 *   post:
 *     summary: Scraper et importer les événements du site officiel
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Scraping terminé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 stats:
 *                   type: object
 *                   properties:
 *                     found:
 *                       type: integer
 *                       description: Nombre d'événements trouvés
 *                     created:
 *                       type: integer
 *                       description: Nombre d'événements créés
 *                     updated:
 *                       type: integer
 *                       description: Nombre d'événements mis à jour
 *                     errors:
 *                       type: integer
 *                       description: Nombre d'erreurs
 *       403:
 *         description: Accès refusé (admin requis)
 *       500:
 *         description: Erreur lors du scraping
 */
router.post('/scrape/events', requireAuth, isAdmin, scrapeController.scrapeAndImportEvents);

/**
 * @swagger
 * /api/admin/scrape/status:
 *   get:
 *     summary: Obtenir le statut du dernier scraping
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statut du scraping
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalImported:
 *                       type: integer
 *                       description: Nombre total d'événements importés
 *                     lastImported:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         date:
 *                           type: string
 *                           format: date-time
 *       403:
 *         description: Accès refusé (admin requis)
 */
router.get('/scrape/status', requireAuth, isAdmin, scrapeController.getScrapeStatus);

module.exports = router;
