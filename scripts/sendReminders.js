#!/usr/bin/env node

/**
 * Send event reminders script
 *
 * This script sends email reminders to volunteers for events happening in 24 hours.
 * It should be run once per day via cron job.
 *
 * Usage:
 *   node scripts/sendReminders.js
 *
 * Cron example (run daily at 10:00 AM):
 *   0 10 * * * cd /path/to/baienevole && node scripts/sendReminders.js >> logs/reminders.log 2>&1
 */

const { sendEventReminders } = require('../src/services/reminderService');
const db = require('../src/utils/db');

async function main() {
  console.log('='.repeat(60));
  console.log('📧 Event Reminder Script Started');
  console.log('='.repeat(60));
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  try {
    const result = await sendEventReminders();

    console.log('\n' + '='.repeat(60));
    console.log('✅ Reminder Script Completed Successfully');
    console.log('='.repeat(60));
    console.log(`Events processed: ${result.eventCount}`);
    console.log(`Reminders sent: ${result.remindersSent}`);
    console.log(`Completed at: ${result.timestamp}`);

    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ Reminder Script Failed');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);

    process.exit(1);
  } finally {
    // Disconnect from database
    await db.$disconnect();
  }
}

// Run the script
main();
