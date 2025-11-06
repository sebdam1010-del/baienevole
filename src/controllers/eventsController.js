const db = require('../utils/db');
const { parse } = require('csv-parse/sync');

// Helper to calculate quota status
const calculateQuotaStatus = (registered, required) => {
  const diff = registered - required;

  if (diff <= 0) {
    return { color: 'green', code: '#ABD4A9', registered, required };
  } else if (diff <= 2) {
    return { color: 'orange', code: '#EF7856', registered, required };
  } else {
    return { color: 'red', code: '#DD2D4A', registered, required };
  }
};

// Helper to check if event is within 24 hours
const isWithin24Hours = (eventDate) => {
  const now = new Date();
  const timeDiff = eventDate.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  return hoursDiff < 24;
};

// Helper to check for time conflicts
const checkTimeConflict = (time1Start, time1End, time2Start, time2End) => {
  const [h1s, m1s] = time1Start.split(':').map(Number);
  const [h1e, m1e] = time1End.split(':').map(Number);
  const [h2s, m2s] = time2Start.split(':').map(Number);
  const [h2e, m2e] = time2End.split(':').map(Number);

  const start1 = h1s * 60 + m1s;
  const end1 = h1e * 60 + m1e;
  const start2 = h2s * 60 + m2s;
  const end2 = h2e * 60 + m2e;

  return (start1 < end2 && end1 > start2);
};

// Helper to validate date format (YYYY-MM-DD)
const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Helper to validate time format (HH:MM)
const isValidTime = (timeString) => {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(timeString);
};

// CREATE - POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const {
      date,
      nom,
      description,
      horaireArrivee,
      horaireDepart,
      nombreSpectatursAttendus,
      nombreBenevolesRequis,
      saison,
      commentaires,
    } = req.body;

    // Validate required fields
    if (!date || !nom || !horaireArrivee || !horaireDepart || !nombreBenevolesRequis || !saison) {
      return res.status(400).json({
        error: 'Required fields: date, nom, horaireArrivee, horaireDepart, nombreBenevolesRequis, saison',
      });
    }

    // Validate date format
    if (!isValidDate(date)) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD',
      });
    }

    // Validate time formats
    if (!isValidTime(horaireArrivee) || !isValidTime(horaireDepart)) {
      return res.status(400).json({
        error: 'Invalid time format. Use HH:MM',
      });
    }

    // Validate saison is positive integer
    if (!Number.isInteger(saison) || saison <= 0) {
      return res.status(400).json({
        error: 'Saison must be a positive integer',
      });
    }

    // Validate nombreBenevolesRequis is positive integer
    if (!Number.isInteger(nombreBenevolesRequis) || nombreBenevolesRequis <= 0) {
      return res.status(400).json({
        error: 'nombreBenevolesRequis must be a positive integer',
      });
    }

    // Create event
    const event = await db.event.create({
      data: {
        date: new Date(date),
        nom,
        description: description || null,
        horaireArrivee,
        horaireDepart,
        nombreSpectatursAttendus: nombreSpectatursAttendus || 0,
        nombreBenevolesRequis,
        saison,
        commentaires: commentaires || null,
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

// READ ALL - GET /api/events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await db.event.findMany({
      orderBy: {
        date: 'asc',
      },
      include: {
        registrations: true,
      },
    });

    // Add quota status to each event
    const eventsWithQuota = events.map((event) => {
      const quotaStatus = calculateQuotaStatus(
        event.registrations.length,
        event.nombreBenevolesRequis
      );

      // Remove registrations from response, only keep quota status
      const { registrations, ...eventData } = event;
      return {
        ...eventData,
        quotaStatus,
      };
    });

    res.status(200).json(eventsWithQuota);
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

// READ ONE - GET /api/events/:id
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await db.event.findUnique({
      where: { id },
      include: {
        registrations: true,
      },
    });

    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
      });
    }

    // Add quota status
    const quotaStatus = calculateQuotaStatus(
      event.registrations.length,
      event.nombreBenevolesRequis
    );

    const { registrations, ...eventData } = event;
    res.status(200).json({
      ...eventData,
      quotaStatus,
    });
  } catch (error) {
    console.error('Get event by id error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

// UPDATE - PUT /api/events/:id
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      nom,
      description,
      horaireArrivee,
      horaireDepart,
      nombreSpectatursAttendus,
      nombreBenevolesRequis,
      saison,
      commentaires,
    } = req.body;

    // Check if event exists
    const existingEvent = await db.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return res.status(404).json({
        error: 'Event not found',
      });
    }

    // Validate date format if provided
    if (date && !isValidDate(date)) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD',
      });
    }

    // Validate time formats if provided
    if (horaireArrivee && !isValidTime(horaireArrivee)) {
      return res.status(400).json({
        error: 'Invalid horaireArrivee format. Use HH:MM',
      });
    }

    if (horaireDepart && !isValidTime(horaireDepart)) {
      return res.status(400).json({
        error: 'Invalid horaireDepart format. Use HH:MM',
      });
    }

    // Validate saison if provided
    if (saison !== undefined && (!Number.isInteger(saison) || saison <= 0)) {
      return res.status(400).json({
        error: 'Saison must be a positive integer',
      });
    }

    // Validate nombreBenevolesRequis if provided
    if (nombreBenevolesRequis !== undefined && (!Number.isInteger(nombreBenevolesRequis) || nombreBenevolesRequis <= 0)) {
      return res.status(400).json({
        error: 'nombreBenevolesRequis must be a positive integer',
      });
    }

    // Build update data
    const updateData = {};
    if (date) {
      updateData.date = new Date(date);
    }
    if (nom) {
      updateData.nom = nom;
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (horaireArrivee) {
      updateData.horaireArrivee = horaireArrivee;
    }
    if (horaireDepart) {
      updateData.horaireDepart = horaireDepart;
    }
    if (nombreSpectatursAttendus !== undefined) {
      updateData.nombreSpectatursAttendus = nombreSpectatursAttendus;
    }
    if (nombreBenevolesRequis !== undefined) {
      updateData.nombreBenevolesRequis = nombreBenevolesRequis;
    }
    if (saison) {
      updateData.saison = saison;
    }
    if (commentaires !== undefined) {
      updateData.commentaires = commentaires;
    }

    // Update event
    const event = await db.event.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

// DELETE - DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if event exists
    const existingEvent = await db.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return res.status(404).json({
        error: 'Event not found',
      });
    }

    // Delete event
    await db.event.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

// IMPORT - POST /api/events/import
exports.importEvents = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided. Please upload a CSV file.',
      });
    }

    // Parse CSV
    let records;
    try {
      records = parse(req.file.buffer.toString(), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid CSV format',
      });
    }

    // Check if CSV is empty
    if (!records || records.length === 0) {
      return res.status(400).json({
        error: 'CSV file is empty',
      });
    }

    // Validate and prepare events
    const errors = [];
    const validEvents = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 2; // +2 because row 1 is header and arrays are 0-indexed
      const rowErrors = [];

      // Check required fields
      if (!record.date) {
        rowErrors.push('date is required');
      }
      if (!record.nom) {
        rowErrors.push('nom is required');
      }
      if (!record.horaireArrivee) {
        rowErrors.push('horaireArrivee is required');
      }
      if (!record.horaireDepart) {
        rowErrors.push('horaireDepart is required');
      }
      if (!record.nombreBenevolesRequis) {
        rowErrors.push('nombreBenevolesRequis is required');
      }
      if (!record.saison) {
        rowErrors.push('saison is required');
      }

      // Validate date format
      if (record.date && !isValidDate(record.date)) {
        rowErrors.push('Invalid date format. Use YYYY-MM-DD');
      }

      // Validate time formats
      if (record.horaireArrivee && !isValidTime(record.horaireArrivee)) {
        rowErrors.push('Invalid horaireArrivee time format. Use HH:MM');
      }

      if (record.horaireDepart && !isValidTime(record.horaireDepart)) {
        rowErrors.push('Invalid horaireDepart time format. Use HH:MM');
      }

      // Validate saison
      const saison = parseInt(record.saison, 10);
      if (record.saison && (isNaN(saison) || saison <= 0)) {
        rowErrors.push('saison must be a positive integer');
      }

      // Validate nombreBenevolesRequis
      const nombreBenevolesRequis = parseInt(record.nombreBenevolesRequis, 10);
      if (record.nombreBenevolesRequis && (isNaN(nombreBenevolesRequis) || nombreBenevolesRequis <= 0)) {
        rowErrors.push('nombreBenevolesRequis must be a positive integer');
      }

      // Validate nombreSpectatursAttendus if provided
      const nombreSpectatursAttendus = parseInt(record.nombreSpectatursAttendus, 10);
      if (record.nombreSpectatursAttendus && (isNaN(nombreSpectatursAttendus) || nombreSpectatursAttendus < 0)) {
        rowErrors.push('nombreSpectatursAttendus must be a non-negative integer');
      }

      // If there are errors for this row, add to errors array
      if (rowErrors.length > 0) {
        errors.push({
          row: rowNumber,
          errors: rowErrors,
        });
      } else {
        // Prepare valid event data
        validEvents.push({
          date: new Date(record.date),
          nom: record.nom,
          description: record.description || null,
          horaireArrivee: record.horaireArrivee,
          horaireDepart: record.horaireDepart,
          nombreSpectatursAttendus: nombreSpectatursAttendus || 0,
          nombreBenevolesRequis: nombreBenevolesRequis,
          saison: saison,
          commentaires: record.commentaires || null,
        });
      }
    }

    // If there are any validation errors, return them
    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: errors,
      });
    }

    // Import valid events
    const importedEvents = [];
    for (const eventData of validEvents) {
      const event = await db.event.create({
        data: eventData,
      });
      importedEvents.push(event);
    }

    res.status(200).json({
      imported: importedEvents.length,
      events: importedEvents,
    });
  } catch (error) {
    console.error('Import events error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

// REGISTER - POST /api/events/:id/register
exports.registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if event exists
    const event = await db.event.findUnique({
      where: { id },
      include: {
        registrations: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
      });
    }

    // Check if event is within 24 hours
    if (isWithin24Hours(event.date)) {
      return res.status(400).json({
        error: 'Registration closed. Events must be registered at least 24 hours in advance.',
      });
    }

    // Check if already registered
    const existingRegistration = await db.eventRegistration.findFirst({
      where: {
        eventId: id,
        userId: userId,
      },
    });

    if (existingRegistration) {
      return res.status(400).json({
        error: 'You are already registered for this event',
      });
    }

    // Check for time conflicts with user's other registrations
    const userRegistrations = await db.eventRegistration.findMany({
      where: {
        userId: userId,
      },
      include: {
        event: true,
      },
    });

    let hasConflict = false;
    const conflictingEvents = [];

    for (const reg of userRegistrations) {
      // Check if same date
      const regDate = new Date(reg.event.date);
      const eventDate = new Date(event.date);

      if (
        regDate.getFullYear() === eventDate.getFullYear() &&
        regDate.getMonth() === eventDate.getMonth() &&
        regDate.getDate() === eventDate.getDate()
      ) {
        // Check if time overlaps
        if (checkTimeConflict(
          reg.event.horaireArrivee,
          reg.event.horaireDepart,
          event.horaireArrivee,
          event.horaireDepart
        )) {
          hasConflict = true;
          conflictingEvents.push(reg.event.nom);
        }
      }
    }

    // Create registration
    const registration = await db.eventRegistration.create({
      data: {
        eventId: id,
        userId: userId,
      },
    });

    const response = {
      message: 'Successfully registered for event',
      registration,
    };

    // Add warning if there's a conflict
    if (hasConflict) {
      response.warning = `Time conflict detected with: ${conflictingEvents.join(', ')}`;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

// UNREGISTER - DELETE /api/events/:id/register
exports.unregisterFromEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if event exists
    const event = await db.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
      });
    }

    // Find registration
    const registration = await db.eventRegistration.findFirst({
      where: {
        eventId: id,
        userId: userId,
      },
    });

    if (!registration) {
      return res.status(404).json({
        error: 'You are not registered for this event',
      });
    }

    // Delete registration
    await db.eventRegistration.delete({
      where: {
        id: registration.id,
      },
    });

    res.status(200).json({
      message: 'Successfully unregistered from event',
    });
  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

// Export events as CSV
exports.exportEventsCSV = async (req, res) => {
  try {
    const { saison, annee } = req.query;

    // Build filter conditions
    const where = {};

    if (saison) {
      where.saison = parseInt(saison);
    }

    if (annee) {
      const year = parseInt(annee);
      where.date = {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      };
    }

    // Fetch events with registrations
    const events = await db.event.findMany({
      where,
      include: {
        registrations: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Build CSV header
    const header = [
      'date',
      'nom',
      'saison',
      'nombre_spectateurs_attendus',
      'nombre_bénévoles_requis',
      'nombre_inscrits',
      'statut_quota',
      'bénévoles_inscrits',
      'commentaires',
    ].join(',');

    // Build CSV rows
    const rows = events.map((event) => {
      const registeredCount = event.registrations.length;
      const requiredCount = event.nombreBenevolesRequis;

      // Calculate quota status
      let status;
      const diff = registeredCount - requiredCount;
      if (diff <= 0) {
        status = 'GREEN';
      } else if (diff <= 2) {
        status = 'ORANGE';
      } else {
        status = 'RED';
      }

      // Build list of registered volunteers (sorted by registration date)
      const sortedRegistrations = [...event.registrations].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      const volunteersList = sortedRegistrations
        .map((reg) => `${reg.user.firstName} ${reg.user.lastName}`)
        .join(';');

      // Format date as YYYY-MM-DD
      const dateStr = event.date.toISOString().split('T')[0];

      // Escape fields that might contain commas or quotes
      const escapeCSV = (field) => {
        if (field === null || field === undefined) return '';
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      return [
        dateStr,
        escapeCSV(event.nom),
        event.saison,
        event.nombreSpectatursAttendus,
        requiredCount,
        registeredCount,
        status,
        escapeCSV(volunteersList),
        escapeCSV(event.commentaires),
      ].join(',');
    });

    // Combine header and rows
    const csv = [header, ...rows].join('\n');

    // Set response headers
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="events-export-${new Date().toISOString().split('T')[0]}.csv"`
    );

    res.status(200).send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};
