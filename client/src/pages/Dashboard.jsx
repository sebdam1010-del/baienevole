import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, upcomingRes, historyRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/upcoming'),
        api.get('/dashboard/history'),
      ]);

      setStats(statsRes.data);
      setUpcomingEvents(upcomingRes.data);
      setHistory(historyRes.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement du tableau de bord');
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

  if (loading) {
    return (
      <div className="text-center py-8">Chargement...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl"
          style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
        >
          Mon tableau de bord
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenue, {user?.firstName} {user?.lastName}
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

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Événements à venir</p>
              <p
                className="text-4xl font-bold"
                style={{ color: 'var(--color-baie-red)' }}
              >
                {stats.upcomingEvents}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Événements passés</p>
              <p
                className="text-4xl font-bold"
                style={{ color: 'var(--color-baie-navy)' }}
              >
                {stats.pastEvents}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Total événements</p>
              <p
                className="text-4xl font-bold"
                style={{ color: 'var(--color-baie-orange)' }}
              >
                {stats.totalEvents}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Heures de bénévolat</p>
              <p
                className="text-4xl font-bold"
                style={{ color: 'var(--color-baie-green)' }}
              >
                {stats.totalHours.toFixed(1)}h
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <h2
          className="text-xl mb-4"
          style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
        >
          Actions rapides
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/">
            <Button variant="primary">
              Voir tous les événements
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="secondary">
              Modifier mon profil
            </Button>
          </Link>
        </div>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-2xl"
            style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
          >
            Mes prochains événements ({upcomingEvents.length})
          </h2>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Vous n'êtes inscrit à aucun événement pour le moment
            </p>
            <Link to="/">
              <Button variant="primary">
                Parcourir les événements
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 border rounded hover:bg-gray-50 transition-colors"
                style={{ borderColor: 'var(--color-baie-beige)' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3
                      className="text-lg"
                      style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
                    >
                      {event.nom}
                    </h3>
                    <p className="text-sm text-gray-700 mt-1">
                      📅 {formatDate(event.date)}
                    </p>
                    <p className="text-sm text-gray-700">
                      🕐 {formatTime(event.horaireArrivee)} → {formatTime(event.horaireDepart)}
                    </p>
                  </div>
                  <Link to={`/events/${event.id}`}>
                    <Button variant="secondary" size="sm">
                      Détails →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* History */}
      <Card>
        <h2
          className="text-2xl mb-4"
          style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
        >
          Historique de mes participations ({history.length})
        </h2>

        {history.length === 0 ? (
          <p className="text-gray-600 text-center py-4">
            Aucun événement passé
          </p>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="p-4 border rounded"
                style={{ borderColor: 'var(--color-baie-beige)' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3
                      className="text-lg"
                      style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
                    >
                      {event.nom}
                    </h3>
                    <p className="text-sm text-gray-700 mt-1">
                      📅 {formatDate(event.date)}
                    </p>
                    <p className="text-sm text-gray-700">
                      🕐 {formatTime(event.horaireArrivee)} → {formatTime(event.horaireDepart)}
                    </p>
                  </div>
                  <div
                    className="px-3 py-1 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: 'var(--color-baie-green)',
                      color: 'white',
                    }}
                  >
                    Participé
                  </div>
                </div>
              </div>
            ))}
            {history.length > 5 && (
              <p className="text-sm text-gray-600 text-center pt-2">
                Et {history.length - 5} autre(s) événement(s)
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
