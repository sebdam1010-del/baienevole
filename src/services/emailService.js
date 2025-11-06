const nodemailer = require('nodemailer');
const db = require('../utils/db');

// Create transporter
const createTransporter = () => {
  // For development, use Ethereal Email (fake SMTP service for testing)
  // For production, configure with real SMTP credentials
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Development/Test: use console logging
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'test@ethereal.email',
      pass: process.env.SMTP_PASS || 'testpassword',
    },
  });
};

/**
 * Format date in French
 */
const formatDate = (date) => {
  const d = new Date(date);
  const day = d.getDate();
  const months = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

/**
 * Format time HH:MM to HHhMM
 */
const formatTime = (timeString) => {
  return timeString.replace(':', 'h');
};

/**
 * Get all admin email addresses from database
 */
const getAdminEmails = async () => {
  try {
    const admins = await db.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true },
    });
    return admins.map((admin) => admin.email);
  } catch (error) {
    console.error('Error fetching admin emails:', error);
    return [];
  }
};

/**
 * Send unregistration alert to admins
 */
const sendUnregistrationAlert = async (volunteerInfo, eventInfo, adminEmails) => {
  if (!adminEmails || adminEmails.length === 0) {
    console.log('No admin emails to send alert to');
    return;
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || '"La Baie des Singes" <noreply@baiedessinges.com>',
    to: adminEmails.join(', '),
    subject: `⚠️ Désinscription - ${eventInfo.nom}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'League Spartan', Arial, sans-serif; color: #131226; }
          .header { background-color: #DD2D4A; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .event-details { background-color: #f9f9f9; border-left: 4px solid #EF7856; padding: 15px; margin: 20px 0; }
          .volunteer-info { background-color: #DFB999; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .stats { font-size: 18px; font-weight: bold; color: #DD2D4A; }
          .footer { color: #666; font-size: 12px; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔔 Alerte Désinscription</h1>
        </div>
        <div class="content">
          <p>Bonjour,</p>
          <p>Un bénévole s'est désinscrit d'un événement :</p>

          <div class="volunteer-info">
            <h3>👤 Bénévole</h3>
            <p><strong>${volunteerInfo.firstName} ${volunteerInfo.lastName}</strong></p>
            <p>Email : ${volunteerInfo.email}</p>
          </div>

          <div class="event-details">
            <h3>📅 Événement</h3>
            <p><strong>${eventInfo.nom}</strong></p>
            <p>Date : ${formatDate(eventInfo.date)}</p>
            <p>Horaires : ${formatTime(eventInfo.horaireArrivee)} → ${formatTime(eventInfo.horaireDepart)}</p>
            <p class="stats">Bénévoles restants : ${eventInfo.registrationsCount} / ${eventInfo.nombreBenevolesRequis} requis</p>
          </div>

          <p>Pensez à vérifier si vous devez trouver un remplaçant.</p>
        </div>
        <div class="footer">
          <p>La Baie des Singes - Plateforme de gestion des bénévoles</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Unregistration alert sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending unregistration alert:', error);
    // Don't throw error - continue even if email fails
  }
};

/**
 * Send event reminder to volunteer
 */
const sendEventReminder = async (volunteerInfo, eventInfo) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || '"La Baie des Singes" <noreply@baiedessinges.com>',
    to: volunteerInfo.email,
    subject: `📅 Rappel - ${eventInfo.nom} demain`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'League Spartan', Arial, sans-serif; color: #131226; }
          .header { background-color: #ABD4A9; color: #131226; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .event-details { background-color: #f9f9f9; border-left: 4px solid #DD2D4A; padding: 15px; margin: 20px 0; }
          .highlight { background-color: #F5AC44; padding: 10px; border-radius: 5px; margin: 20px 0; }
          .footer { color: #666; font-size: 12px; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔔 Rappel d'événement</h1>
        </div>
        <div class="content">
          <p>Bonjour ${volunteerInfo.firstName} ${volunteerInfo.lastName},</p>

          <div class="highlight">
            <p style="margin: 0; font-size: 18px;"><strong>📍 Vous êtes inscrit(e) à un événement demain !</strong></p>
          </div>

          <div class="event-details">
            <h3>${eventInfo.nom}</h3>
            ${eventInfo.description ? `<p>${eventInfo.description}</p>` : ''}
            <p><strong>📅 Date :</strong> ${formatDate(eventInfo.date)}</p>
            <p><strong>🕐 Horaires :</strong> ${formatTime(eventInfo.horaireArrivee)} → ${formatTime(eventInfo.horaireDepart)}</p>
            ${eventInfo.commentaires ? `<p><strong>💬 Commentaires :</strong> ${eventInfo.commentaires}</p>` : ''}
          </div>

          <p>Merci de votre engagement pour La Baie des Singes ! 🎭</p>
          <p>À demain !</p>
        </div>
        <div class="footer">
          <p>La Baie des Singes - Plateforme de gestion des bénévoles</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Event reminder sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending event reminder:', error);
    // Don't throw error - continue even if email fails
  }
};

/**
 * Send registration confirmation to volunteer
 */
const sendRegistrationConfirmation = async (volunteerInfo, eventInfo) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || '"La Baie des Singes" <noreply@baiedessinges.com>',
    to: volunteerInfo.email,
    subject: `✅ Confirmation d'inscription - ${eventInfo.nom}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'League Spartan', Arial, sans-serif; color: #131226; }
          .header { background-color: #ABD4A9; color: #131226; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .event-details { background-color: #f9f9f9; border-left: 4px solid #DD2D4A; padding: 15px; margin: 20px 0; }
          .success { background-color: #D1FAE5; padding: 15px; border-radius: 5px; margin: 20px 0; border: 2px solid #ABD4A9; }
          .footer { color: #666; font-size: 12px; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✅ Inscription confirmée</h1>
        </div>
        <div class="content">
          <p>Bonjour ${volunteerInfo.firstName} ${volunteerInfo.lastName},</p>

          <div class="success">
            <p style="margin: 0; font-size: 18px;"><strong>🎉 Votre inscription est confirmée !</strong></p>
          </div>

          <div class="event-details">
            <h3>${eventInfo.nom}</h3>
            ${eventInfo.description ? `<p>${eventInfo.description}</p>` : ''}
            <p><strong>📅 Date :</strong> ${formatDate(eventInfo.date)}</p>
            <p><strong>🕐 Horaires :</strong> ${formatTime(eventInfo.horaireArrivee)} → ${formatTime(eventInfo.horaireDepart)}</p>
          </div>

          <p>Vous recevrez un rappel 24 heures avant l'événement.</p>
          <p>Merci pour votre engagement ! 🎭</p>
        </div>
        <div class="footer">
          <p>La Baie des Singes - Plateforme de gestion des bénévoles</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Registration confirmation sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending registration confirmation:', error);
    // Don't throw error - continue even if email fails
  }
};

module.exports = {
  sendUnregistrationAlert,
  sendEventReminder,
  sendRegistrationConfirmation,
  getAdminEmails,
  formatDate,
  formatTime,
};
