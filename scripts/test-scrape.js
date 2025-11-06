#!/usr/bin/env node

/**
 * Script de test pour le scraping amélioré
 * Teste sur les 3 premiers événements uniquement
 */

const puppeteer = require('puppeteer');
const he = require('he');

const SITE_URL = 'https://www.baiedessinges.com/programme/liste/';

const log = {
  info: (msg) => console.log(`\x1b[34mℹ\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m✓\x1b[0m ${msg}`),
  warning: (msg) => console.log(`\x1b[33m⚠\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m✗\x1b[0m ${msg}`),
};

async function scrapeEventsFromPage(page) {
  const events = await page.evaluate(() => {
    const eventsList = [];
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');

    scripts.forEach((script) => {
      try {
        const data = JSON.parse(script.textContent);
        const eventsArray = Array.isArray(data) ? data : [data];

        eventsArray.forEach((item) => {
          if (item['@type'] === 'Event') {
            const event = {
              nom: item.name || '',
              imageUrl: item.image || null,
              urlSite: item.url || null,
              date: item.startDate || null,
              description: item.description || '',
            };

            if (event.nom && event.urlSite) {
              eventsList.push(event);
            }
          }
        });
      } catch (error) {
        console.error('Erreur parsing JSON-LD:', error);
      }
    });

    return eventsList;
  });

  return events;
}

async function enrichEventDetails(page, event) {
  try {
    if (!event.urlSite) return event;

    log.info(`  → Visite de la page: ${event.nom}`);

    await page.goto(event.urlSite, {
      waitUntil: 'networkidle2',
      timeout: 15000,
    });

    const details = await page.evaluate(() => {
      const result = {};

      let descEl = document.querySelector('.tribe-events-single-event-description');
      if (!descEl) {
        descEl = document.querySelector('.entry-content, .event-description, .content, article .description');
      }

      if (descEl) {
        result.descriptionHtml = descEl.innerHTML.trim();
        result.description = descEl.textContent.trim();
      }

      const venueEl = document.querySelector('.tribe-venue, .event-venue, [itemprop="location"]');
      if (venueEl) {
        result.location = venueEl.textContent.trim();
      }

      return result;
    });

    const enrichedEvent = {
      ...event,
      nom: he.decode(event.nom),
      ...details,
    };

    if (enrichedEvent.description) {
      enrichedEvent.description = he.decode(enrichedEvent.description);
    }
    if (enrichedEvent.descriptionHtml) {
      enrichedEvent.descriptionHtml = he.decode(enrichedEvent.descriptionHtml);
    }

    return enrichedEvent;
  } catch (error) {
    log.warning(`  ✗ Impossible d'enrichir "${event.nom}": ${error.message}`);
    return event;
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  Test du scraping amélioré                ║');
  console.log('╚════════════════════════════════════════════╝\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    log.info('Chargement de la première page...');
    await page.goto(SITE_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    const pageEvents = await scrapeEventsFromPage(page);
    log.success(`${pageEvents.length} événements trouvés`);

    // Ne tester que les 3 premiers
    const eventsToTest = pageEvents.slice(0, 3);
    log.info(`\nTest sur ${eventsToTest.length} événements:\n`);

    for (const event of eventsToTest) {
      console.log('─'.repeat(50));
      log.info(`Événement AVANT enrichissement:`);
      console.log(`  Nom: ${event.nom}`);
      console.log(`  Description (extrait): ${event.description.substring(0, 100)}...`);
      console.log(`  URL: ${event.urlSite}`);

      const enrichedEvent = await enrichEventDetails(page, event);

      log.success(`Événement APRÈS enrichissement:`);
      console.log(`  Nom décodé: ${enrichedEvent.nom}`);
      console.log(`  Description complète (longueur): ${enrichedEvent.description?.length || 0} caractères`);
      if (enrichedEvent.description) {
        console.log(`  Description (extrait): ${enrichedEvent.description.substring(0, 150)}...`);
      }
      console.log('');
    }

    console.log('═'.repeat(50));
    log.success('Test terminé avec succès !');
  } catch (error) {
    log.error(`Erreur: ${error.message}`);
    console.error(error);
  } finally {
    await browser.close();
  }
}

main();
