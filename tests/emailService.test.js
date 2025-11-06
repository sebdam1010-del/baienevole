const emailService = require('../src/services/emailService');
const db = require('../src/utils/db');

// Mock nodemailer
jest.mock('nodemailer');
const nodemailer = require('nodemailer');

describe('Email Service', () => {
  let mockSendMail;
  let mockTransporter;

  beforeEach(() => {
    // Setup mock transporter
    mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });
    mockTransporter = {
      sendMail: mockSendMail,
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('sendUnregistrationAlert', () => {
    it('should send email to all admins when volunteer unregisters', async () => {
      const volunteerInfo = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      const eventInfo = {
        nom: 'Concert acoustique',
        date: new Date('2025-12-15'),
        horaireArrivee: '18:30',
        horaireDepart: '22:00',
        nombreBenevolesRequis: 5,
        registrationsCount: 4,
      };

      const adminEmails = ['admin1@example.com', 'admin2@example.com'];

      await emailService.sendUnregistrationAlert(volunteerInfo, eventInfo, adminEmails);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: adminEmails.join(', '),
          subject: expect.stringContaining('Désinscription'),
          html: expect.stringContaining('John Doe'),
          html: expect.stringContaining('Concert acoustique'),
        })
      );
    });

    it('should include remaining volunteers count in email', async () => {
      const volunteerInfo = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
      };

      const eventInfo = {
        nom: 'Théâtre',
        date: new Date('2025-12-20'),
        horaireArrivee: '19:00',
        horaireDepart: '22:30',
        nombreBenevolesRequis: 8,
        registrationsCount: 6,
      };

      const adminEmails = ['admin@example.com'];

      await emailService.sendUnregistrationAlert(volunteerInfo, eventInfo, adminEmails);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('6'),
          html: expect.stringContaining('8'),
        })
      );
    });

    it('should handle email sending errors gracefully', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

      const volunteerInfo = {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob@example.com',
      };

      const eventInfo = {
        nom: 'Test Event',
        date: new Date('2025-12-15'),
        horaireArrivee: '14:00',
        horaireDepart: '18:00',
        nombreBenevolesRequis: 5,
        registrationsCount: 3,
      };

      const adminEmails = ['admin@example.com'];

      // Should not throw error
      await expect(
        emailService.sendUnregistrationAlert(volunteerInfo, eventInfo, adminEmails)
      ).resolves.not.toThrow();
    });
  });

  describe('sendEventReminder', () => {
    it('should send reminder email to registered volunteer', async () => {
      const volunteerInfo = {
        firstName: 'Alice',
        lastName: 'Williams',
        email: 'alice@example.com',
      };

      const eventInfo = {
        nom: 'Marionnettes',
        description: 'Spectacle pour enfants',
        date: new Date('2025-12-16'),
        horaireArrivee: '14:00',
        horaireDepart: '17:30',
      };

      await emailService.sendEventReminder(volunteerInfo, eventInfo);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'alice@example.com',
          subject: expect.stringContaining('Rappel'),
          html: expect.stringContaining('Alice Williams'),
          html: expect.stringContaining('Marionnettes'),
          html: expect.stringContaining('demain'),
        })
      );
    });

    it('should include event details in reminder', async () => {
      const volunteerInfo = {
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'charlie@example.com',
      };

      const eventInfo = {
        nom: 'Concert',
        description: 'Concert en plein air',
        date: new Date('2025-12-17'),
        horaireArrivee: '18:30',
        horaireDepart: '22:00',
        commentaires: 'Annulation si pluie',
      };

      await emailService.sendEventReminder(volunteerInfo, eventInfo);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('18h30'),
          html: expect.stringContaining('22h00'),
          html: expect.stringContaining('Concert en plein air'),
        })
      );
    });

    it('should handle reminder sending errors gracefully', async () => {
      mockSendMail.mockRejectedValue(new Error('Network error'));

      const volunteerInfo = {
        firstName: 'David',
        lastName: 'Miller',
        email: 'david@example.com',
      };

      const eventInfo = {
        nom: 'Test Event',
        date: new Date('2025-12-18'),
        horaireArrivee: '10:00',
        horaireDepart: '12:00',
      };

      // Should not throw error
      await expect(
        emailService.sendEventReminder(volunteerInfo, eventInfo)
      ).resolves.not.toThrow();
    });
  });

  describe('sendRegistrationConfirmation', () => {
    it('should send confirmation email to volunteer after registration', async () => {
      const volunteerInfo = {
        firstName: 'Emma',
        lastName: 'Davis',
        email: 'emma@example.com',
      };

      const eventInfo = {
        nom: 'Atelier théâtre',
        description: 'Atelier découverte',
        date: new Date('2025-12-20'),
        horaireArrivee: '15:00',
        horaireDepart: '17:00',
      };

      await emailService.sendRegistrationConfirmation(volunteerInfo, eventInfo);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'emma@example.com',
          subject: expect.stringContaining('Confirmation'),
          html: expect.stringContaining('Emma Davis'),
          html: expect.stringContaining('Atelier théâtre'),
        })
      );
    });
  });

  describe('getAdminEmails', () => {
    beforeEach(async () => {
      // Clean up
      await db.user.deleteMany();
    });

    afterAll(async () => {
      await db.user.deleteMany();
      await db.$disconnect();
    });

    it('should return list of admin email addresses', async () => {
      // Create test admins
      await db.user.create({
        data: {
          email: 'admin1@example.com',
          password: 'hashed',
          firstName: 'Admin',
          lastName: 'One',
          role: 'ADMIN',
        },
      });

      await db.user.create({
        data: {
          email: 'admin2@example.com',
          password: 'hashed',
          firstName: 'Admin',
          lastName: 'Two',
          role: 'ADMIN',
        },
      });

      // Create volunteer (should not be included)
      await db.user.create({
        data: {
          email: 'volunteer@example.com',
          password: 'hashed',
          firstName: 'Volunteer',
          lastName: 'User',
          role: 'VOLUNTEER',
        },
      });

      const adminEmails = await emailService.getAdminEmails();

      expect(adminEmails).toHaveLength(2);
      expect(adminEmails).toContain('admin1@example.com');
      expect(adminEmails).toContain('admin2@example.com');
      expect(adminEmails).not.toContain('volunteer@example.com');
    });

    it('should return empty array if no admins exist', async () => {
      const adminEmails = await emailService.getAdminEmails();

      expect(adminEmails).toHaveLength(0);
      expect(Array.isArray(adminEmails)).toBe(true);
    });
  });
});
