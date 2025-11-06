const { scrapeEvents, saveEvents } = require('../../scripts/scrapeEvents');

/**
 * Déclenche le scraping des événements
 * @route POST /api/admin/scrape/events
 */
const scrapeAndImportEvents = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin (déjà fait par le middleware)

    // Démarrer le scraping
    const events = await scrapeEvents();

    if (!events || events.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Aucun événement trouvé sur le site',
        stats: {
          found: 0,
          created: 0,
          updated: 0,
          errors: 0,
        },
      });
    }

    // Sauvegarder les événements
    const stats = await saveEvents(events);

    return res.status(200).json({
      success: true,
      message: `Scraping terminé avec succès`,
      stats: {
        found: events.length,
        created: stats.created,
        updated: stats.updated,
        skipped: stats.skipped || 0,
        errors: stats.errors,
      },
    });
  } catch (error) {
    console.error('Erreur scraping:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du scraping',
      error: error.message,
    });
  }
};

/**
 * Obtient le statut du dernier scraping
 * @route GET /api/admin/scrape/status
 */
const getScrapeStatus = async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Compter les événements importés depuis le site
    const importedEvents = await prisma.event.count({
      where: {
        urlSite: {
          not: null,
        },
      },
    });

    // Obtenir le dernier événement importé
    const lastImported = await prisma.event.findFirst({
      where: {
        urlSite: {
          not: null,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        nom: true,
        updatedAt: true,
      },
    });

    await prisma.$disconnect();

    return res.status(200).json({
      success: true,
      stats: {
        totalImported: importedEvents,
        lastImported: lastImported
          ? {
              name: lastImported.nom,
              date: lastImported.updatedAt,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Erreur statut scraping:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du statut',
      error: error.message,
    });
  }
};

module.exports = {
  scrapeAndImportEvents,
  getScrapeStatus,
};
