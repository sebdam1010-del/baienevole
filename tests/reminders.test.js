const db = require('../src/utils/db');
const { sendEventReminders } = require('../src/services/reminderService');
const emailService = require('../src/services/emailService');

// Mock email service
jest.mock('../src/services/emailService');

describe('Event Reminders', () => {
  let futureEvent; // Event in 24-25 hours
  let tooEarlyEvent; // Event in 30 hours
  let tooLateEvent; // Event in 12 hours
  let volunteer1;
  let volunteer2;

  beforeEach(async () => {
    // Clean up
    await db.eventRegistration.deleteMany();
    await db.event.deleteMany();
    await db.user.deleteMany();

    // Clear mocks
    jest.clearAllMocks();

    // Create volunteers
    volunteer1 = await db.user.create({
      data: {
        email: `reminder-vol1-${Date.now()}@example.com`,
        password: 'hashed',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'VOLUNTEER',
      },
    });

    volunteer2 = await db.user.create({
      data: {
        email: `reminder-vol2-${Date.now()}@example.com`,
        password: 'hashed',
        firstName: 'Bob',
        lastName: 'Smith',
        role: 'VOLUNTEER',
      },
    });

    const now = new Date();

    // Event in 24.5 hours (should send reminder)
    const futureDate = new Date(now);
    futureDate.setHours(futureDate.getHours() + 24);
    futureDate.setMinutes(futureDate.getMinutes() + 30);
    futureEvent = await db.event.create({
      data: {
        date: futureDate,
        nom: 'Concert demain',
        description: 'Concert en plein air',
        horaireArrivee: '18:00',
        horaireDepart: '22:00',
        nombreBenevolesRequis: 5,
        saison: 29,
        commentaires: 'Apporter une veste',
      },
    });

    // Event in 30 hours (too early - should NOT send reminder)
    const tooEarlyDate = new Date(now);
    tooEarlyDate.setHours(tooEarlyDate.getHours() + 30);
    tooEarlyEvent = await db.event.create({
      data: {
        date: tooEarlyDate,
        nom: 'Event trop tôt',
        horaireArrivee: '14:00',
        horaireDepart: '18:00',
        nombreBenevolesRequis: 3,
        saison: 29,
      },
    });

    // Event in 12 hours (too late - should NOT send reminder)
    const tooLateDate = new Date(now);
    tooLateDate.setHours(tooLateDate.getHours() + 12);
    tooLateEvent = await db.event.create({
      data: {
        date: tooLateDate,
        nom: 'Event trop tard',
        horaireArrivee: '10:00',
        horaireDepart: '14:00',
        nombreBenevolesRequis: 3,
        saison: 29,
      },
    });

    // Register volunteers
    await db.eventRegistration.create({
      data: {
        eventId: futureEvent.id,
        userId: volunteer1.id,
      },
    });

    await db.eventRegistration.create({
      data: {
        eventId: futureEvent.id,
        userId: volunteer2.id,
      },
    });

    await db.eventRegistration.create({
      data: {
        eventId: tooEarlyEvent.id,
        userId: volunteer1.id,
      },
    });

    await db.eventRegistration.create({
      data: {
        eventId: tooLateEvent.id,
        userId: volunteer2.id,
      },
    });
  });

  afterAll(async () => {
    await db.eventRegistration.deleteMany();
    await db.event.deleteMany();
    await db.user.deleteMany();
    await db.$disconnect();
  });

  describe('sendEventReminders', () => {
    it('should send reminders only for events in 23-25 hour window', async () => {
      // Mock sendEventReminder to resolve successfully
      emailService.sendEventReminder.mockResolvedValue({ messageId: 'test-123' });

      await sendEventReminders();

      // Should be called twice (2 volunteers for futureEvent)
      expect(emailService.sendEventReminder).toHaveBeenCalledTimes(2);

      // Verify called with correct volunteer info
      expect(emailService.sendEventReminder).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Alice',
          lastName: 'Johnson',
          email: volunteer1.email,
        }),
        expect.objectContaining({
          nom: 'Concert demain',
          description: 'Concert en plein air',
        })
      );

      expect(emailService.sendEventReminder).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Bob',
          lastName: 'Smith',
          email: volunteer2.email,
        }),
        expect.objectContaining({
          nom: 'Concert demain',
        })
      );
    });

    it('should NOT send reminders for events too early (>25h)', async () => {
      emailService.sendEventReminder.mockResolvedValue({ messageId: 'test-123' });

      await sendEventReminders();

      // Check that tooEarlyEvent was not sent
      const calls = emailService.sendEventReminder.mock.calls;
      const sentEventNames = calls.map((call) => call[1].nom);

      expect(sentEventNames).not.toContain('Event trop tôt');
    });

    it('should NOT send reminders for events too late (<23h)', async () => {
      emailService.sendEventReminder.mockResolvedValue({ messageId: 'test-123' });

      await sendEventReminders();

      // Check that tooLateEvent was not sent
      const calls = emailService.sendEventReminder.mock.calls;
      const sentEventNames = calls.map((call) => call[1].nom);

      expect(sentEventNames).not.toContain('Event trop tard');
    });

    it('should continue even if one email fails', async () => {
      // First call fails, second succeeds
      emailService.sendEventReminder
        .mockRejectedValueOnce(new Error('SMTP error'))
        .mockResolvedValueOnce({ messageId: 'test-123' });

      await sendEventReminders();

      // Should still be called twice
      expect(emailService.sendEventReminder).toHaveBeenCalledTimes(2);
    });

    it('should return summary of sent reminders', async () => {
      emailService.sendEventReminder.mockResolvedValue({ messageId: 'test-123' });

      const result = await sendEventReminders();

      expect(result).toHaveProperty('eventCount');
      expect(result).toHaveProperty('remindersSent');
      expect(result.eventCount).toBe(1); // Only futureEvent
      expect(result.remindersSent).toBe(2); // 2 volunteers
    });

    it('should handle no upcoming events gracefully', async () => {
      // Delete all registrations and events
      await db.eventRegistration.deleteMany();
      await db.event.deleteMany();

      emailService.sendEventReminder.mockResolvedValue({ messageId: 'test-123' });

      const result = await sendEventReminders();

      expect(result.eventCount).toBe(0);
      expect(result.remindersSent).toBe(0);
      expect(emailService.sendEventReminder).not.toHaveBeenCalled();
    });
  });
});
