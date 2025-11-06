const db = require('../utils/db');

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

// Helper to calculate hours between two times (HH:MM format)
const calculateHours = (startTime, endTime) => {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return (endMinutes - startMinutes) / 60;
};

// GET MY EVENTS - GET /api/dashboard/my-events
exports.getMyEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all events the user is registered to
    const registrations = await db.eventRegistration.findMany({
      where: {
        userId: userId,
      },
      include: {
        event: {
          include: {
            registrations: true,
          },
        },
      },
      orderBy: {
        event: {
          date: 'asc',
        },
      },
    });

    // Transform and add quota status
    const events = registrations.map((reg) => {
      const event = reg.event;
      const quotaStatus = calculateQuotaStatus(
        event.registrations.length,
        event.nombreBenevolesRequis
      );

      const { registrations, ...eventData } = event;
      return {
        ...eventData,
        quotaStatus,
      };
    });

    res.status(200).json(events);
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

// GET UPCOMING EVENTS - GET /api/dashboard/upcoming
exports.getUpcomingEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Get future events the user is registered to
    const registrations = await db.eventRegistration.findMany({
      where: {
        userId: userId,
        event: {
          date: {
            gte: now,
          },
        },
      },
      include: {
        event: {
          include: {
            registrations: true,
          },
        },
      },
      orderBy: {
        event: {
          date: 'asc',
        },
      },
    });

    // Transform and add quota status
    const events = registrations.map((reg) => {
      const event = reg.event;
      const quotaStatus = calculateQuotaStatus(
        event.registrations.length,
        event.nombreBenevolesRequis
      );

      const { registrations, ...eventData } = event;
      return {
        ...eventData,
        quotaStatus,
      };
    });

    res.status(200).json(events);
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

// GET HISTORY - GET /api/dashboard/history
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Get past events the user is registered to
    const registrations = await db.eventRegistration.findMany({
      where: {
        userId: userId,
        event: {
          date: {
            lt: now,
          },
        },
      },
      include: {
        event: {
          include: {
            registrations: true,
          },
        },
      },
      orderBy: {
        event: {
          date: 'desc', // Most recent first for history
        },
      },
    });

    // Transform and add quota status
    const events = registrations.map((reg) => {
      const event = reg.event;
      const quotaStatus = calculateQuotaStatus(
        event.registrations.length,
        event.nombreBenevolesRequis
      );

      const { registrations, ...eventData } = event;
      return {
        ...eventData,
        quotaStatus,
      };
    });

    res.status(200).json(events);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

// GET STATS - GET /api/dashboard/stats
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Get all events the user is registered to
    const registrations = await db.eventRegistration.findMany({
      where: {
        userId: userId,
      },
      include: {
        event: true,
      },
    });

    // Calculate statistics
    const totalEvents = registrations.length;

    const upcomingEvents = registrations.filter((reg) => {
      return new Date(reg.event.date) >= now;
    }).length;

    const pastEvents = registrations.filter((reg) => {
      return new Date(reg.event.date) < now;
    }).length;

    // Calculate total volunteer hours
    const totalHours = registrations.reduce((sum, reg) => {
      const hours = calculateHours(
        reg.event.horaireArrivee,
        reg.event.horaireDepart
      );
      return sum + hours;
    }, 0);

    res.status(200).json({
      totalEvents,
      upcomingEvents,
      pastEvents,
      totalHours,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};
