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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const currentWeekRef = useRef(null);
  const hasScrolled = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchEvents(controller.signal);
    return () => controller.abort();
  }, [filters, pagination.page]);

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
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filters.saison) params.saison = filters.saison;
      if (filters.annee) params.annee = filters.annee;

      const response = await api.get('/events', { params, signal });

      // Handle paginated response
      if (response.data.events && response.data.pagination) {
        setEvents(response.data.events);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination,
        }));
      } else {
        // Fallback for non-paginated response (backward compatibility)
        setEvents(response.data);
      }

      setError('');
    } catch (err) {
      // Ignore abort errors (they're expected when component unmounts)
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
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
    // Reset to page 1 when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
    hasScrolled.current = false; // Allow scroll to current week on filter change
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    hasScrolled.current = false; // Allow scroll to current week on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Trouver l'index de l'événement de la semaine en cours (premier événement futur ou plus récent)
  const currentWeekEventIndex = useMemo(() => {
    if (filteredEvents.length === 0) return -1;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Chercher le premier événement futur ou dans la semaine passée
    const index = filteredEvents.findIndex(event => {
      const eventDate = new Date(event.date);
      return eventDate >= oneWeekAgo;
    });

    // Si aucun événement futur, retourner le dernier événement
    return index >= 0 ? index : filteredEvents.length - 1;
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

      {/* Pagination Controls */}
      {!loading && filteredEvents.length > 0 && pagination.totalPages > 1 && (
        <Card>
          <div className="flex items-center justify-between">
            {/* Page Info */}
            <div className="text-sm" style={{ color: 'var(--color-baie-navy)' }}>
              Page {pagination.page} sur {pagination.totalPages}
              <span className="ml-3 text-gray-600">
                ({pagination.totalCount} événement{pagination.totalCount > 1 ? 's' : ''} au total)
              </span>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPreviousPage}
              >
                ← Précédent
              </Button>

              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  // Show first page, current page -1, current page, current page +1, last page
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="min-w-[40px]"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
              >
                Suivant →
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Events;
