import { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, Select, Badge, Card, Textarea } from '../../components/ui';
import api from '../../services/api';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    saison: '',
    annee: '',
    search: '',
  });

  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [selectedEventForRegistrations, setSelectedEventForRegistrations] = useState(null);

  // Form data
  const [eventFormData, setEventFormData] = useState({
    nom: '',
    date: '',
    horaireArrivee: '',
    horaireDepart: '',
    saison: 1,
    nombreBenevolesRequis: 5,
    nombreSpectatursAttendus: 0,
    description: '',
    commentaires: '',
  });

  // Statistics
  const [statistics, setStatistics] = useState({
    averageFillRate: 0,
    topVolunteers: [],
    topEvents: [],
  });

  useEffect(() => {
    fetchEvents();
    fetchVolunteers();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.saison) params.saison = filters.saison;
      if (filters.annee) params.annee = filters.annee;

      const response = await api.get('/admin/events', { params });
      let eventsData = response.data;

      // Client-side search filter
      if (filters.search) {
        eventsData = eventsData.filter(event =>
          event.nom.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setEvents(eventsData);
      calculateStatistics(eventsData);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des événements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const response = await api.get('/volunteers');
      setVolunteers(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des bénévoles:', err);
    }
  };

  const calculateStatistics = (eventsData) => {
    if (eventsData.length === 0) {
      setStatistics({ averageFillRate: 0, topVolunteers: [], topEvents: [] });
      return;
    }

    // Calculate average fill rate
    const totalFillRate = eventsData.reduce((sum, event) => {
      const fillRate = (event.registrations.length / event.nombreBenevolesRequis) * 100;
      return sum + fillRate;
    }, 0);
    const averageFillRate = (totalFillRate / eventsData.length).toFixed(1);

    // Top volunteers (most registrations)
    const volunteerCounts = {};
    eventsData.forEach(event => {
      event.registrations.forEach(reg => {
        const key = `${reg.user.firstName} ${reg.user.lastName}`;
        volunteerCounts[key] = (volunteerCounts[key] || 0) + 1;
      });
    });
    const topVolunteers = Object.entries(volunteerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Top events (most registrations)
    const topEvents = [...eventsData]
      .sort((a, b) => b.registrations.length - a.registrations.length)
      .slice(0, 5)
      .map(event => ({ name: event.nom, count: event.registrations.length }));

    setStatistics({ averageFillRate, topVolunteers, topEvents });
  };

  const getQuotaStatus = (event) => {
    const count = event.registrations.length;
    const quota = event.nombreBenevolesRequis;

    if (count <= quota) return { color: 'success', text: 'OK' };
    if (count <= quota + 2) return { color: 'warning', text: 'Orange' };
    return { color: 'danger', text: 'Rouge' };
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleEventFormChange = (e) => {
    const { name, value } = e.target;
    // Convert numeric fields to numbers
    const processedValue = ['saison', 'nombreBenevolesRequis', 'nombreSpectatursAttendus'].includes(name)
      ? parseInt(value) || 0
      : value;
    setEventFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleCreateEvent = () => {
    setCurrentEvent(null);
    setEventFormData({
      nom: '',
      date: '',
      horaireArrivee: '',
      horaireDepart: '',
      saison: 1,
      nombreBenevolesRequis: 5,
      nombreSpectatursAttendus: 0,
      description: '',
      commentaires: '',
    });
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setCurrentEvent(event);
    setEventFormData({
      nom: event.nom,
      date: event.date.split('T')[0],
      horaireArrivee: event.horaireArrivee,
      horaireDepart: event.horaireDepart,
      saison: event.saison,
      nombreBenevolesRequis: event.nombreBenevolesRequis,
      nombreSpectatursAttendus: event.nombreSpectatursAttendus || 0,
      description: event.description || '',
      commentaires: event.commentaires || '',
    });
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = (event) => {
    setCurrentEvent(event);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    try {
      if (currentEvent) {
        // Update
        await api.put(`/events/${currentEvent.id}`, eventFormData);
      } else {
        // Create
        await api.post('/events', eventFormData);
      }
      setIsEventModalOpen(false);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    }
  };

  const confirmDeleteEvent = async () => {
    try {
      await api.delete(`/events/${currentEvent.id}`);
      setIsDeleteModalOpen(false);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const handleManageRegistrations = (event) => {
    setSelectedEventForRegistrations(event);
    setIsRegistrationModalOpen(true);
  };

  const handleRegisterVolunteer = async (volunteerId) => {
    try {
      await api.post(`/events/${selectedEventForRegistrations.id}/register`, {
        userId: volunteerId,
      });
      fetchEvents();
      // Refresh the selected event
      const response = await api.get(`/events/${selectedEventForRegistrations.id}`);
      setSelectedEventForRegistrations(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
    }
  };

  const handleUnregisterVolunteer = async (registrationId) => {
    try {
      await api.delete(`/admin/registrations/${registrationId}`);
      fetchEvents();
      // Refresh the selected event
      const response = await api.get(`/events/${selectedEventForRegistrations.id}`);
      setSelectedEventForRegistrations(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la désinscription');
    }
  };

  const handleExportCSV = async (eventId) => {
    try {
      const response = await api.get(`/admin/events/${eventId}/export`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `event_${eventId}_registrations.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Erreur lors de l\'export CSV');
    }
  };

  const columns = [
    {
      header: 'Date',
      accessor: 'date',
      render: (value) => new Date(value).toLocaleDateString('fr-FR'),
    },
    {
      header: 'Nom',
      accessor: 'nom',
    },
    {
      header: 'Saison',
      accessor: 'saison',
    },
    {
      header: 'Inscrits',
      accessor: 'registrations',
      render: (value, row) => `${value.length} / ${row.nombreBenevolesRequis}`,
    },
    {
      header: 'Statut',
      accessor: 'id',
      render: (value, row) => {
        const status = getQuotaStatus(row);
        return <Badge variant={status.color}>{status.text}</Badge>;
      },
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (value, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleEditEvent(row)}
          >
            Modifier
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleManageRegistrations(row)}
          >
            Inscrits
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleExportCSV(row.id)}
          >
            CSV
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteEvent(row)}
          >
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  const availableVolunteersForRegistration = volunteers.filter(
    volunteer =>
      !selectedEventForRegistrations?.registrations.some(
        reg => reg.userId === volunteer.id
      )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-3xl"
          style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
        >
          Gestion des événements
        </h1>
        <Button variant="primary" onClick={handleCreateEvent}>
          Créer un événement
        </Button>
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3
            className="text-lg mb-2"
            style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
          >
            Taux de remplissage moyen
          </h3>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-baie-red)' }}>
            {statistics.averageFillRate}%
          </p>
        </Card>

        <Card>
          <h3
            className="text-lg mb-2"
            style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
          >
            Bénévoles les plus actifs
          </h3>
          <ul className="space-y-1 text-sm">
            {statistics.topVolunteers.map((v, i) => (
              <li key={i}>
                {v.name} - {v.count} inscriptions
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3
            className="text-lg mb-2"
            style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
          >
            Événements les plus demandés
          </h3>
          <ul className="space-y-1 text-sm">
            {statistics.topEvents.map((e, i) => (
              <li key={i}>
                {e.name} - {e.count} inscrits
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <Input
            label="Année"
            type="number"
            name="annee"
            value={filters.annee}
            onChange={handleFilterChange}
            placeholder="2024"
          />

          <Input
            label="Recherche"
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Nom de l'événement..."
          />
        </div>
      </Card>

      {/* Events Table */}
      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <Table columns={columns} data={events} />
      )}

      {/* Event Create/Edit Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title={currentEvent ? 'Modifier l\'événement' : 'Créer un événement'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEventModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleSubmitEvent}>
              {currentEvent ? 'Mettre à jour' : 'Créer'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitEvent} className="space-y-4">
          <Input
            label="Nom de l'événement"
            name="nom"
            value={eventFormData.nom}
            onChange={handleEventFormChange}
            required
          />

          <Input
            label="Date"
            type="date"
            name="date"
            value={eventFormData.date}
            onChange={handleEventFormChange}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Heure d'arrivée"
              type="time"
              name="horaireArrivee"
              value={eventFormData.horaireArrivee}
              onChange={handleEventFormChange}
              required
            />

            <Input
              label="Heure de départ"
              type="time"
              name="horaireDepart"
              value={eventFormData.horaireDepart}
              onChange={handleEventFormChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Saison"
              name="saison"
              value={eventFormData.saison}
              onChange={handleEventFormChange}
              required
            >
              <option value="1">Saison 1</option>
              <option value="2">Saison 2</option>
              <option value="3">Saison 3</option>
              <option value="4">Saison 4</option>
            </Select>

            <Input
              label="Nombre de bénévoles requis"
              type="number"
              name="nombreBenevolesRequis"
              value={eventFormData.nombreBenevolesRequis}
              onChange={handleEventFormChange}
              min="1"
              required
            />
          </div>

          <Input
            label="Nombre de spectateurs attendus"
            type="number"
            name="nombreSpectatursAttendus"
            value={eventFormData.nombreSpectatursAttendus}
            onChange={handleEventFormChange}
            min="0"
            helperText="Optionnel"
          />

          <Textarea
            label="Description"
            name="description"
            value={eventFormData.description}
            onChange={handleEventFormChange}
            placeholder="Description de l'événement..."
            rows={3}
            helperText="Optionnel"
          />

          <Textarea
            label="Commentaires"
            name="commentaires"
            value={eventFormData.commentaires}
            onChange={handleEventFormChange}
            placeholder="Commentaires additionnels..."
            rows={2}
            helperText="Optionnel"
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmer la suppression"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={confirmDeleteEvent}>
              Supprimer
            </Button>
          </>
        }
      >
        <p>
          Êtes-vous sûr de vouloir supprimer l'événement{' '}
          <strong>{currentEvent?.nom}</strong> ?
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Cette action est irréversible.
        </p>
      </Modal>

      {/* Registrations Management Modal */}
      <Modal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        title={`Gestion des inscriptions - ${selectedEventForRegistrations?.nom}`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Add Volunteer */}
          <div>
            <h4
              className="text-lg mb-3"
              style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
            >
              Inscrire un bénévole
            </h4>
            <Select
              onChange={(e) => {
                if (e.target.value) {
                  handleRegisterVolunteer(parseInt(e.target.value));
                  e.target.value = '';
                }
              }}
            >
              <option value="">Sélectionner un bénévole...</option>
              {availableVolunteersForRegistration.map(volunteer => (
                <option key={volunteer.id} value={volunteer.id}>
                  {volunteer.firstName} {volunteer.lastName}
                </option>
              ))}
            </Select>
          </div>

          {/* Registered Volunteers */}
          <div>
            <h4
              className="text-lg mb-3"
              style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
            >
              Bénévoles inscrits ({selectedEventForRegistrations?.registrations.length || 0})
            </h4>
            {selectedEventForRegistrations?.registrations.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun bénévole inscrit</p>
            ) : (
              <div className="space-y-2">
                {selectedEventForRegistrations?.registrations.map(registration => (
                  <div
                    key={registration.id}
                    className="flex items-center justify-between p-3 border rounded"
                    style={{ borderColor: 'var(--color-baie-beige)' }}
                  >
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--color-baie-navy)' }}>
                        {registration.user.firstName} {registration.user.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Inscrit le {new Date(registration.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleUnregisterVolunteer(registration.id)}
                    >
                      Désinscrire
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminEvents;
