import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../services/api';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchEvent();
  }, [id]);

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

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement de l\'événement');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
    return timeString.replace(':', 'h');
  };

  const formatRegistrationDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `Inscrit le ${day}/${month} à ${hours}h${minutes}`;
  };

  const isUserRegistered = () => {
    if (!user || !event || !event.registrations) return false;
    return event.registrations.some(reg => reg.userId === user.id);
  };

  const isEventPast = () => {
    if (!event) return false;
    return new Date(event.date) < new Date();
  };

  const handleRegister = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccessMessage('');
      await api.post(`/events/${id}/register`);
      setSuccessMessage('Inscription réussie !');
      await fetchEvent(); // Refresh to show updated registration
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setActionLoading(false);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleUnregister = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccessMessage('');
      await api.delete(`/events/${id}/register`);
      setSuccessMessage('Désinscription réussie !');
      await fetchEvent(); // Refresh to show updated registration
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la désinscription');
    } finally {
      setActionLoading(false);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">Chargement...</div>
    );
  }

  if (!event) {
    return (
      <Card>
        <p className="text-center text-gray-600">Événement introuvable</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
        ← Retour
      </Button>

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

      {/* Event Details Card */}
      <Card>
        <div className="flex items-start gap-6">
          {/* Event Image - Portrait à gauche */}
          {event.imageUrl && (
            <div className="w-64 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={getImageUrl(event.imageUrl)}
                alt={event.nom}
                className="w-full h-full object-cover object-top"
                style={{ minHeight: '400px' }}
                onError={(e) => {
                  e.target.parentElement.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Event content */}
          <div className="flex-1 space-y-4">
            <div>
              <h1
                className="text-3xl"
                style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
              >
                {event.nom}
              </h1>
              {event.urlSite && (
                <a
                  href={event.urlSite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-sm hover:underline"
                  style={{ color: 'var(--color-baie-green)' }}
                >
                  🔗 Voir l'événement sur le site officiel
                </a>
              )}
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Date</p>
              <p className="font-semibold" style={{ color: 'var(--color-baie-navy)' }}>
                {formatDate(event.date)}
              </p>
            </div>

            <div>
              <p className="text-gray-600">Horaires</p>
              <p className="font-semibold" style={{ color: 'var(--color-baie-navy)' }}>
                {formatTime(event.horaireArrivee)} → {formatTime(event.horaireDepart)}
              </p>
            </div>

            <div>
              <p className="text-gray-600">Saison</p>
              <p className="font-semibold" style={{ color: 'var(--color-baie-navy)' }}>
                Saison {event.saison}
              </p>
            </div>

            <div>
              <p className="text-gray-600">Bénévoles requis</p>
              <p className="font-semibold" style={{ color: 'var(--color-baie-navy)' }}>
                {event.nombreBenevolesRequis}
              </p>
            </div>
          </div>

          {event.description && (
            <div>
              <p className="text-gray-600 mb-2">Description</p>
              <div
                className="text-sm prose prose-sm max-w-none"
                style={{ color: 'var(--color-baie-navy)' }}
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </div>
          )}

          {event.commentaires && (
            <div>
              <p className="text-gray-600 mb-2">Commentaires</p>
              <p className="text-sm text-gray-700">
                {event.commentaires}
              </p>
            </div>
          )}

          <div className="pt-4">
            {isEventPast() ? (
              <div className="text-sm text-gray-600">
                Cet événement est terminé. L'inscription n'est plus possible.
              </div>
            ) : isUserRegistered() ? (
              <Button
                variant="danger"
                onClick={handleUnregister}
                disabled={actionLoading}
              >
                {actionLoading ? 'Désinscription...' : 'Se désinscrire'}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleRegister}
                disabled={actionLoading}
              >
                {actionLoading ? 'Inscription...' : 'S\'inscrire à cet événement'}
              </Button>
            )}
          </div>
          </div>
        </div>
      </Card>

      {/* Registered Volunteers */}
      <Card>
        <h2
          className="text-2xl mb-4"
          style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
        >
          Bénévoles inscrits ({event.registrations?.length || 0})
        </h2>

        {!event.registrations || event.registrations.length === 0 ? (
          <p className="text-gray-600 text-sm">Aucun bénévole inscrit pour le moment</p>
        ) : (
          <div className="space-y-3">
            {event.registrations
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((registration) => (
                <div
                  key={registration.id}
                  className="p-4 border rounded"
                  style={{ borderColor: 'var(--color-baie-beige)' }}
                >
                  <p className="font-semibold" style={{ color: 'var(--color-baie-navy)' }}>
                    {registration.user.firstName} {registration.user.lastName}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatRegistrationDate(registration.createdAt)}
                  </p>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default EventDetail;
