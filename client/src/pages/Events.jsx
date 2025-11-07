import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Select, Badge } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../services/api';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [filters, setFilters] = useState({
    saison: '',
    annee: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const currentWeekRef = useRef(null);
  const hasScrolled = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchEvents(controller.signal);
    return () => controller.abort();
  }, [filters]);

  // Scroll vers la semaine en cours lors du chargement initial
  useEffect(() => {
    if (!loading && events.length > 0 && currentWeekRef.current && !hasScrolled.current) {
      setTimeout(() => {
        currentWeekRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        hasScrolled.current = true;
      }, 300);
    }
  }, [loading, events]);

  // Fermer les alertes au scroll ou au clic
  useEffect(() => {
    const handleDismissAlerts = () => {
      if (error) setError('');
      if (successMessage) setSuccessMessage('');
    };

    window.addEventListener('scroll', handleDismissAlerts);
    window.addEventListener('click', handleDismissAlerts);

    return () => {
      window.removeEventListener('scroll', handleDismissAlerts);
      window.removeEventListener('click', handleDismissAlerts);
    };
  }, [error, successMessage]);

  const fetchEvents = async (signal) => {
    try {
      setLoading(true);
      const params = {};

      // Ne pas utiliser la pagination - charger tous les événements pour permettre le scroll et les filtres
      if (filters.saison) params.saison = filters.saison;
      if (filters.annee) params.annee = filters.annee;

      const response = await api.get('/events', { params, signal });

      // Handle paginated response (mais on ignore la pagination pour l'instant)
      if (response.data.events && response.data.pagination) {
        setEvents(response.data.events);
      } else {
        // Fallback for non-paginated response (backward compatibility)
        setEvents(response.data);
      }

      setError('');
    } catch (err) {
      // Ignore abort errors (they're expected when component unmounts or dependencies change)
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED' || err.code === 'ECONNABORTED') {
        return;
      }
      setError('Erreur lors du chargement des événements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    hasScrolled.current = false; // Allow scroll to current week on filter change
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatTime = (timeString) => {
    // Convert "HH:MM" to "HHhMM"
    return timeString.replace(':', 'h');
  };

  const getQuotaColor = (event) => {
    const registered = event.registrations?.length || 0;
    const required = event.nombreBenevolesRequis;
    const diff = registered - required;

    if (diff <= 0) return '#ABD4A9'; // Green
    if (diff <= 2) return '#EF7856'; // Orange
    return '#DD2D4A'; // Red
  };

  const isUserRegistered = (event) => {
    if (!user || !event.registrations) return false;
    return event.registrations.some(reg => reg.userId === user.id);
  };

  const isEventPast = (event) => {
    if (!event) return false;
    return new Date(event.date) < new Date();
  };

  const handleRegister = async (eventId) => {
    try {
      setActionLoading(prev => ({ ...prev, [eventId]: true }));
      setError('');
      setSuccessMessage('');
      await api.post(`/events/${eventId}/register`);
      setSuccessMessage('Inscription réussie !');

      // Update only the specific event instead of refreshing all
      const updatedEvent = await api.get(`/events/${eventId}`);
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === eventId ? updatedEvent.data : event
        )
      );

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setActionLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleUnregister = async (eventId) => {
    try {
      setActionLoading(prev => ({ ...prev, [eventId]: true }));
      setError('');
      setSuccessMessage('');
      await api.delete(`/events/${eventId}/register`);
      setSuccessMessage('Désinscription réussie !');

      // Update only the specific event instead of refreshing all
      const updatedEvent = await api.get(`/events/${eventId}`);
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === eventId ? updatedEvent.data : event
        )
      );

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la désinscription');
    } finally {
      setActionLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const getVolunteerNames = (event) => {
    if (!event.registrations || event.registrations.length === 0) {
      return [];
    }
    return event.registrations.map(reg => reg.user?.firstName || 'Inconnu');
  };

  // Filter events by search query
  const filteredEvents = events.filter(event => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return event.nom.toLowerCase().includes(query);
  });

  // Extract unique seasons and years from events - using useMemo to ensure proper updates
  const availableSeasons = useMemo(() => {
    return [...new Set(
      events
        .map(e => e.saison)
        .filter(saison => saison != null && !isNaN(saison))
    )].sort((a, b) => a - b);
  }, [events]);

  const availableYears = useMemo(() => {
    return [...new Set(
      events
        .map(e => {
          try {
            const year = new Date(e.date).getFullYear();
            return !isNaN(year) && year > 1900 && year < 2100 ? year : null;
          } catch {
            return null;
          }
        })
        .filter(year => year != null)
    )].sort((a, b) => b - a);
  }, [events]);

  // Trouver l'index de l'événement de la semaine en cours
  // Les événements sont triés par date décroissante (du plus récent au plus ancien)
  const currentWeekEventIndex = useMemo(() => {
    if (filteredEvents.length === 0) return -1;

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Minuit aujourd'hui

    // Chercher le dernier événement futur (le plus proche de maintenant)
    // On parcourt de la fin vers le début car les événements sont en ordre décroissant
    for (let i = filteredEvents.length - 1; i >= 0; i--) {
      const eventDate = new Date(filteredEvents[i].date);
      eventDate.setHours(0, 0, 0, 0);

      // Si l'événement est aujourd'hui ou dans le futur
      if (eventDate >= now) {
        return i;
      }
    }

    // Si tous les événements sont passés, retourner le premier (le plus récent des événements passés)
    return 0;
  }, [filteredEvents]);

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl"
          style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
        >
          Événements
        </h1>
        <p className="text-gray-600 mt-2">
          Parcourez les événements et inscrivez-vous
        </p>
      </div>

      {error && (
        <div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg border text-sm shadow-lg max-w-md w-full mx-4"
          style={{
            backgroundColor: '#FEE2E2',
            borderColor: 'var(--color-baie-red)',
            color: 'var(--color-baie-red)',
          }}
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg border text-sm shadow-lg max-w-md w-full mx-4"
          style={{
            backgroundColor: '#D1FAE5',
            borderColor: 'var(--color-baie-green)',
            color: '#065F46',
          }}
        >
          {successMessage}
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search Field */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-baie-navy)' }}>
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Rechercher un événement par titre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                borderColor: '#D1D5DB',
                focusRing: 'var(--color-baie-green)',
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Saison"
              name="saison"
              value={filters.saison}
              onChange={handleFilterChange}
            >
              <option value="">Toutes les saisons</option>
              {availableSeasons.map(saison => (
                <option key={saison} value={saison}>
                  Saison {saison}
                </option>
              ))}
            </Select>

            <Select
              label="Année"
              name="annee"
              value={filters.annee}
              onChange={handleFilterChange}
            >
              <option value="">Toutes les années</option>
              {availableYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : filteredEvents.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600">
            {searchQuery ? `Aucun événement trouvé pour "${searchQuery}"` : 'Aucun événement trouvé'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => {
            const volunteerNames = getVolunteerNames(event);
            const quotaColor = getQuotaColor(event);
            const registered = isUserRegistered(event);
            const isCurrentWeek = index === currentWeekEventIndex;

            return (
              <Card
                key={event.id}
                className="relative overflow-hidden p-0"
                ref={isCurrentWeek ? currentWeekRef : null}
              >
                <div className="flex items-start">
                  {/* Event Image with Lazy Loading - Portrait à gauche */}
                  {event.imageUrl && (
                    <div className="relative w-48 flex-shrink-0 bg-gray-200">
                      <img
                        src={getImageUrl(event.imageUrl)}
                        alt={event.nom}
                        loading="lazy"
                        className="w-full h-full object-cover object-top"
                        style={{ minHeight: '280px' }}
                        onError={(e) => {
                          e.target.parentElement.style.display = 'none';
                        }}
                      />
                      {/* Quota Status Dot on Image */}
                      <div
                        className="absolute top-2 right-2 rounded-full shadow-lg"
                        style={{
                          backgroundColor: quotaColor,
                          width: '16px',
                          height: '16px',
                        }}
                        title={`Statut: ${quotaColor === '#ABD4A9' ? 'OK' : quotaColor === '#EF7856' ? 'Orange' : 'Rouge'}`}
                      />
                    </div>
                  )}

                  <div className="p-4 flex-1 flex flex-col justify-between" style={{ minHeight: '280px' }}>
                    {/* Quota Status Dot (if no image) */}
                    {!event.imageUrl && (
                      <div
                        className="absolute top-4 right-4 rounded-full"
                        style={{
                          backgroundColor: quotaColor,
                          width: '16px',
                          height: '16px',
                        }}
                        title={`Statut: ${quotaColor === '#ABD4A9' ? 'OK' : quotaColor === '#EF7856' ? 'Orange' : 'Rouge'}`}
                      />
                    )}

                  {/* Content top section */}
                  <div className="space-y-3">

                  {/* Event Title */}
                  <h3
                    className="text-xl"
                    style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
                  >
                    {event.nom}
                  </h3>

                  {/* Date */}
                  <p className="text-sm" style={{ color: 'var(--color-baie-navy)' }}>
                    📅 {formatDate(event.date)}
                  </p>

                  {/* Hours */}
                  <p className="text-sm text-gray-700">
                    🕐 {formatTime(event.horaireArrivee)} → {formatTime(event.horaireDepart)}
                  </p>

                  {/* Volunteers as Hashtags */}
                  {volunteerNames.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {volunteerNames.map((name, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: 'var(--color-baie-beige)',
                            color: 'var(--color-baie-navy)',
                          }}
                        >
                          #{name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">Aucun bénévole inscrit</p>
                  )}
                  </div>

                  {/* Action Buttons - Bottom section */}
                  <div className="flex gap-2">
                    {isEventPast(event) ? (
                      <div className="flex-1 text-xs text-gray-500 flex items-center justify-center">
                        Événement terminé
                      </div>
                    ) : registered ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleUnregister(event.id)}
                        className="flex-1"
                        disabled={actionLoading[event.id]}
                      >
                        {actionLoading[event.id] ? 'Désinscription...' : 'Se désinscrire'}
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleRegister(event.id)}
                        className="flex-1"
                        disabled={actionLoading[event.id]}
                      >
                        {actionLoading[event.id] ? 'Inscription...' : 'S\'inscrire'}
                      </Button>
                    )}
                    <Link to={`/events/${event.id}`} className="flex-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                      >
                        Détails →
                      </Button>
                    </Link>
                  </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Events;
