#!/usr/bin/env node

/**
 * Script de scraping des événements du site Baie des Singes
 * Récupère les événements, images, tarifs et URLs depuis https://www.baiedessinges.com/programme/liste/
 */

const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configuration
const SITE_URL = 'https://www.baiedessinges.com/programme/liste/';
const IMAGES_DIR = path.join(__dirname, '../public/images/events');
const CURRENT_SEASON = 30; // Saison 2024-2025

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
};

/**
 * Crée le dossier d'images s'il n'existe pas
 */
async function ensureImagesDirectory() {
  try {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    log.success(`Dossier images créé: ${IMAGES_DIR}`);
  } catch (error) {
    log.error(`Erreur création dossier: ${error.message}`);
  }
}

/**
 * Télécharge une image et la sauvegarde localement
 */
async function downloadImage(imageUrl, eventName) {
  try {
    // Générer un nom de fichier sécurisé
    const sanitizedName = eventName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);

    const extension = path.extname(new URL(imageUrl).pathname) || '.jpg';
    const filename = `${sanitizedName}-${Date.now()}${extension}`;
    const filepath = path.join(IMAGES_DIR, filename);

    // Télécharger l'image
    const response = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'arraybuffer',
      timeout: 10000,
    });

    // Sauvegarder l'image
    await fs.writeFile(filepath, response.data);

    // Retourner le chemin relatif pour la base de données
    return `/images/events/${filename}`;
  } catch (error) {
    log.error(`Erreur téléchargement image: ${error.message}`);
    return null;
  }
}

/**
 * Parse une date française (ex: "Vendredi 15 mars 2025")
 */
function parseFrenchDate(dateStr) {
  try {
    const months = {
      janvier: 0,
      février: 1,
      mars: 2,
      avril: 3,
      mai: 4,
      juin: 5,
      juillet: 6,
      août: 7,
      septembre: 8,
      octobre: 9,
      novembre: 10,
      décembre: 11,
    };

    // Extraire jour, mois, année
    const match = dateStr.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/i);
    if (!match) {
      throw new Error(`Format de date invalide: ${dateStr}`);
    }

    const day = parseInt(match[1], 10);
    const monthName = match[2].toLowerCase();
    const year = parseInt(match[3], 10);

    const month = months[monthName];
    if (month === undefined) {
      throw new Error(`Mois inconnu: ${monthName}`);
    }

    return new Date(year, month, day);
  } catch (error) {
    log.error(`Erreur parsing date "${dateStr}": ${error.message}`);
    return new Date(); // Retourner la date du jour par défaut
  }
}

/**
 * Scrape les événements du site
 */
async function scrapeEvents() {
  log.info('Démarrage du scraping...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );

    log.info(`Navigation vers ${SITE_URL}...`);
    await page.goto(SITE_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    log.info('Extraction des événements...');

    // Extraire les événements
    const events = await page.evaluate(() => {
      const eventsList = [];

      // Sélectionner tous les événements
      // NOTE: À adapter selon la structure HTML réelle du site
      const eventElements = document.querySelectorAll('.event-item, .programme-item, article.event, .spectacle-item');

      eventElements.forEach((el) => {
        try {
          // Récupérer les informations (à adapter selon le HTML)
          const titleEl = el.querySelector('h2, h3, .title, .event-title, .spectacle-titre');
          const imageEl = el.querySelector('img');
          const linkEl = el.querySelector('a[href*="/spectacle/"], a[href*="/programme/"]');
          const dateEl = el.querySelector('.date, .event-date, time, .spectacle-date');
          const priceEl = el.querySelector('.price, .tarif, .prix, .event-price');
          const descriptionEl = el.querySelector('.description, .excerpt, .event-description, p');

          if (!titleEl) return;

          const event = {
            nom: titleEl.textContent.trim(),
            imageUrl: imageEl ? (imageEl.src || imageEl.dataset.src) : null,
            urlSite: linkEl ? linkEl.href : null,
            date: dateEl ? dateEl.textContent.trim() : null,
            tarif: priceEl ? priceEl.textContent.trim() : 'Non spécifié',
            description: descriptionEl ? descriptionEl.textContent.trim().substring(0, 500) : null,
          };

          // Vérifier que l'événement a au moins un nom et une URL
          if (event.nom && event.urlSite) {
            eventsList.push(event);
          }
        } catch (error) {
          console.error('Erreur extraction événement:', error);
        }
      });

      return eventsList;
    });

    log.success(`${events.length} événement(s) trouvé(s)`);

    if (events.length === 0) {
      log.warning('Aucun événement trouvé. Vérifiez les sélecteurs CSS.');
      log.info('Sauvegarde du HTML pour débogage...');
      const html = await page.content();
      await fs.writeFile(path.join(__dirname, '../debug-scraping.html'), html);
      log.info('HTML sauvegardé dans debug-scraping.html');
    }

    return events;
  } finally {
    await browser.close();
  }
}

/**
 * Enrichit un événement en visitant sa page détaillée
 */
async function enrichEventDetails(browser, event) {
  try {
    if (!event.urlSite) return event;

    const page = await browser.newPage();
    await page.goto(event.urlSite, {
      waitUntil: 'networkidle2',
      timeout: 15000,
    });

    // Extraire des informations supplémentaires
    const details = await page.evaluate(() => {
      const result = {};

      // Horaires (à adapter selon le HTML)
      const horaireEl = document.querySelector('.horaire, .event-time, .spectacle-horaire');
      if (horaireEl) {
        result.horaire = horaireEl.textContent.trim();
      }

      // Description complète
      const descEl = document.querySelector('.content, .description-complete, .spectacle-description');
      if (descEl) {
        result.description = descEl.textContent.trim();
      }

      return result;
    });

    await page.close();

    return {
      ...event,
      ...details,
    };
  } catch (error) {
    log.warning(`Impossible d'enrichir "${event.nom}": ${error.message}`);
    return event;
  }
}

/**
 * Convertit un événement scrapé en format base de données
 */
async function convertToDbFormat(scrapedEvent) {
  try {
    // Parser la date
    const eventDate = scrapedEvent.date
      ? parseFrenchDate(scrapedEvent.date)
      : new Date();

    // Télécharger l'image si disponible
    let imageUrl = null;
    if (scrapedEvent.imageUrl) {
      log.info(`Téléchargement image: ${scrapedEvent.nom}`);
      imageUrl = await downloadImage(scrapedEvent.imageUrl, scrapedEvent.nom);
    }

    // Extraire les horaires depuis la description ou utiliser des valeurs par défaut
    const horaireMatch = scrapedEvent.horaire?.match(/(\d{1,2})[h:](\d{2})/);
    const horaireArrivee = horaireMatch
      ? `${horaireMatch[1].padStart(2, '0')}:${horaireMatch[2]}`
      : '19:00';

    return {
      date: eventDate,
      nom: scrapedEvent.nom,
      description: scrapedEvent.description || `Spectacle: ${scrapedEvent.nom}`,
      horaireArrivee,
      horaireDepart: '23:00', // Par défaut
      nombreSpectatursAttendus: 100, // Valeur par défaut
      nombreBenevolesRequis: 5, // Valeur par défaut
      saison: CURRENT_SEASON,
      commentaires: `Importé depuis le site officiel`,
      imageUrl,
      tarif: scrapedEvent.tarif,
      urlSite: scrapedEvent.urlSite,
    };
  } catch (error) {
    log.error(`Erreur conversion événement "${scrapedEvent.nom}": ${error.message}`);
    throw error;
  }
}

/**
 * Sauvegarde les événements dans la base de données
 */
async function saveEvents(events) {
  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const scrapedEvent of events) {
    try {
      const dbEvent = await convertToDbFormat(scrapedEvent);

      // Vérifier si l'événement existe déjà (par nom et date)
      const existing = await prisma.event.findFirst({
        where: {
          nom: dbEvent.nom,
          date: {
            gte: new Date(dbEvent.date.setHours(0, 0, 0, 0)),
            lt: new Date(dbEvent.date.setHours(23, 59, 59, 999)),
          },
        },
      });

      if (existing) {
        // Mettre à jour l'événement existant
        await prisma.event.update({
          where: { id: existing.id },
          data: dbEvent,
        });
        log.info(`Mis à jour: ${dbEvent.nom}`);
        updated++;
      } else {
        // Créer un nouvel événement
        await prisma.event.create({
          data: dbEvent,
        });
        log.success(`Créé: ${dbEvent.nom}`);
        created++;
      }
    } catch (error) {
      log.error(`Erreur sauvegarde "${scrapedEvent.nom}": ${error.message}`);
      errors++;
    }
  }

  return { created, updated, errors };
}

/**
 * Point d'entrée principal
 */
async function main() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  Scraping Baie des Singes - Événements    ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // Créer le dossier d'images
    await ensureImagesDirectory();

    // Scraper les événements
    const events = await scrapeEvents();

    if (events.length === 0) {
      log.warning('Aucun événement à importer');
      return;
    }

    // Sauvegarder dans la base de données
    log.info('Sauvegarde dans la base de données...');
    const stats = await saveEvents(events);

    // Afficher le résumé
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║              Résumé                        ║');
    console.log('╚════════════════════════════════════════════╝\n');
    log.success(`Événements créés: ${stats.created}`);
    log.info(`Événements mis à jour: ${stats.updated}`);
    if (stats.errors > 0) {
      log.error(`Erreurs: ${stats.errors}`);
    }
    console.log('');
  } catch (error) {
    log.error(`Erreur fatale: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution
if (require.main === module) {
  main();
}

module.exports = { scrapeEvents, saveEvents };
