import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Select, Badge } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

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

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.saison) params.saison = filters.saison;
      if (filters.annee) params.annee = filters.annee;

      const response = await api.get('/events', { params });
      setEvents(response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des événements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
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

  const handleRegister = async (eventId) => {
    try {
      setActionLoading(prev => ({ ...prev, [eventId]: true }));
      setError('');
      setSuccessMessage('');
      await api.post(`/events/${eventId}/register`);
      setSuccessMessage('Inscription réussie !');
      await fetchEvents(); // Refresh to show updated registration
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
      await fetchEvents(); // Refresh to show updated registration
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
          className="p-3 rounded border text-sm"
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
          className="p-3 rounded border text-sm"
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
              <option value="1">Saison 1</option>
              <option value="2">Saison 2</option>
              <option value="3">Saison 3</option>
              <option value="4">Saison 4</option>
            </Select>

            <Select
              label="Année"
              name="annee"
              value={filters.annee}
              onChange={handleFilterChange}
            >
              <option value="">Toutes les années</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
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
          {filteredEvents.map((event) => {
            const volunteerNames = getVolunteerNames(event);
            const quotaColor = getQuotaColor(event);
            const registered = isUserRegistered(event);

            return (
              <Card key={event.id} className="relative overflow-hidden p-0">
                {/* Event Image with Lazy Loading */}
                {event.imageUrl && (
                  <div className="relative w-full h-48 bg-gray-200">
                    <img
                      src={event.imageUrl}
                      alt={event.nom}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    {/* Quota Status Dot on Image */}
                    <div
                      className="absolute top-3 right-3 rounded-full shadow-lg"
                      style={{
                        backgroundColor: quotaColor,
                        width: '20px',
                        height: '20px',
                      }}
                      title={`Statut: ${quotaColor === '#ABD4A9' ? 'OK' : quotaColor === '#EF7856' ? 'Orange' : 'Rouge'}`}
                    />
                  </div>
                )}

                <div className="p-4 space-y-3">
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

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {registered ? (
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
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Events;
