const db = require('../utils/db');

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
    });

    res.status(200).json(events);
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
    });

    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
      });
    }

    res.status(200).json(event);
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
