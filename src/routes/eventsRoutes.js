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

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Liste tous les événements
 *     tags: [Events]
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
 *         description: Liste des événements avec quota status
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *   post:
 *     summary: Créer un événement (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - date
 *               - horaireArrivee
 *               - horaireDepart
 *               - nombreBenevolesRequis
 *               - saison
 *             properties:
 *               nom:
 *                 type: string
 *                 example: Concert acoustique
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-25"
 *               horaireArrivee:
 *                 type: string
 *                 example: "18:30"
 *               horaireDepart:
 *                 type: string
 *                 example: "22:00"
 *               nombreBenevolesRequis:
 *                 type: integer
 *                 example: 8
 *               nombreSpectatursAttendus:
 *                 type: integer
 *                 example: 200
 *               saison:
 *                 type: integer
 *                 example: 29
 *               commentaires:
 *                 type: string
 *     responses:
 *       201:
 *         description: Événement créé
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès refusé (admin requis)
 */
router.get('/', eventsController.getAllEvents);

/**
 * @swagger
 * /api/events/export/csv:
 *   get:
 *     summary: Exporter événements en CSV
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: saison
 *         schema:
 *           type: integer
 *       - in: query
 *         name: annee
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Fichier CSV
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/export/csv', eventsController.exportEventsCSV);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Détails d'un événement
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'événement
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Événement non trouvé
 *   put:
 *     summary: Modifier un événement (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               horaireArrivee:
 *                 type: string
 *               horaireDepart:
 *                 type: string
 *               nombreBenevolesRequis:
 *                 type: integer
 *               nombreSpectatursAttendus:
 *                 type: integer
 *               saison:
 *                 type: integer
 *               commentaires:
 *                 type: string
 *     responses:
 *       200:
 *         description: Événement modifié
 *       404:
 *         description: Événement non trouvé
 *       403:
 *         description: Accès refusé
 *   delete:
 *     summary: Supprimer un événement (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Événement supprimé
 *       404:
 *         description: Événement non trouvé
 *       403:
 *         description: Accès refusé
 */
router.get('/:id', eventsController.getEventById);

// Protected routes (admin only)
router.post('/', requireAuth, isAdmin, eventsController.createEvent);

/**
 * @swagger
 * /api/events/import:
 *   post:
 *     summary: Importer événements depuis CSV (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Fichier CSV (max 5MB)
 *     responses:
 *       200:
 *         description: Événements importés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 imported:
 *                   type: integer
 *                 skipped:
 *                   type: integer
 *       400:
 *         description: Erreur de validation
 *       403:
 *         description: Accès refusé
 */
router.post('/import', requireAuth, isAdmin, upload.single('file'), eventsController.importEvents);
router.put('/:id', requireAuth, isAdmin, eventsController.updateEvent);
router.delete('/:id', requireAuth, isAdmin, eventsController.deleteEvent);

/**
 * @swagger
 * /api/events/{id}/register:
 *   post:
 *     summary: S'inscrire à un événement
 *     tags: [Registration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Inscription réussie
 *       400:
 *         description: Inscription impossible (< 24h ou déjà inscrit)
 *       401:
 *         description: Non authentifié
 *   delete:
 *     summary: Se désinscrire d'un événement
 *     tags: [Registration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Désinscription réussie
 *       404:
 *         description: Inscription non trouvée
 *       401:
 *         description: Non authentifié
 */
router.post('/:id/register', requireAuth, eventsController.registerForEvent);
router.delete('/:id/register', requireAuth, eventsController.unregisterFromEvent);

module.exports = router;
