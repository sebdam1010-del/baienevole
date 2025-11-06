const db = require('../utils/db');
const emailService = require('./emailService');

/**
 * Send event reminders to all volunteers registered for events happening in 23-25 hours
 * This function should be run once per day (e.g., via cron job)
 *
 * @returns {Promise<{eventCount: number, remindersSent: number}>}
 */
const sendEventReminders = async () => {
  try {
    const now = new Date();

    // Calculate time window: 23-25 hours from now
    const minTime = new Date(now);
    minTime.setHours(minTime.getHours() + 23);

    const maxTime = new Date(now);
    maxTime.setHours(maxTime.getHours() + 25);

    console.log(`Checking for events between ${minTime.toISOString()} and ${maxTime.toISOString()}`);

    // Find all events happening in the next 23-25 hours with registrations
    const upcomingEvents = await db.event.findMany({
      where: {
        date: {
          gte: minTime,
          lte: maxTime,
        },
      },
      include: {
        registrations: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log(`Found ${upcomingEvents.length} events in reminder window`);

    let remindersSent = 0;

    // Send reminders to all registered volunteers
    for (const event of upcomingEvents) {
      console.log(`Processing event: ${event.nom} with ${event.registrations.length} registrations`);

      for (const registration of event.registrations) {
        const volunteer = registration.user;

        try {
          await emailService.sendEventReminder(
            {
              firstName: volunteer.firstName,
              lastName: volunteer.lastName,
              email: volunteer.email,
            },
            {
              nom: event.nom,
              description: event.description,
              date: event.date,
              horaireArrivee: event.horaireArrivee,
              horaireDepart: event.horaireDepart,
              commentaires: event.commentaires,
            }
          );

          remindersSent++;
          console.log(`✓ Reminder sent to ${volunteer.email} for event "${event.nom}"`);
        } catch (error) {
          console.error(`✗ Failed to send reminder to ${volunteer.email}:`, error.message);
          // Continue with next volunteer even if one fails
        }
      }
    }

    const summary = {
      eventCount: upcomingEvents.length,
      remindersSent,
      timestamp: new Date().toISOString(),
    };

    console.log('Reminder summary:', summary);
    return summary;
  } catch (error) {
    console.error('Error in sendEventReminders:', error);
    throw error;
  }
};

module.exports = {
  sendEventReminders,
};
