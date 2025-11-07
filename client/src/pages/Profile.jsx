import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Card, Input, Textarea, Button } from '../components/ui';

const Profile = () => {
  const { user: authUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    skills: '',
    availability: '',
    bio: '',
  });

  // Charger les données du profil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/profile');
        const userData = response.data;

        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          skills: userData.skills || '',
          availability: userData.availability || '',
          bio: userData.bio || '',
        });
        setError('');
      } catch (err) {
        setError('Erreur lors du chargement du profil');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear success/error on change
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await api.put('/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || null,
        skills: formData.skills || null,
        availability: formData.availability || null,
        bio: formData.bio || null,
      });

      // Mettre à jour le contexte d'authentification
      if (response.data.profile) {
        updateUser(response.data.profile);
      }

      setSuccess('Profil mis à jour avec succès !');
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour du profil');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Restaurer les données originales
    if (authUser) {
      setFormData({
        firstName: authUser.firstName || '',
        lastName: authUser.lastName || '',
        email: authUser.email || '',
        phone: authUser.phone || '',
        skills: authUser.skills || '',
        availability: authUser.availability || '',
        bio: authUser.bio || '',
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg" style={{ color: 'var(--color-baie-navy)' }}>
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-protest" style={{ color: 'var(--color-baie-navy)' }}>
          Mon profil
        </h1>
        {!isEditing && (
          <Button
            variant="primary"
            onClick={() => setIsEditing(true)}
          >
            Modifier
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 border rounded-lg" style={{
          backgroundColor: 'var(--color-baie-vert-light)',
          borderColor: 'var(--color-baie-vert)'
        }}>
          <p className="text-sm" style={{ color: 'var(--color-baie-navy)' }}>
            {success}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <h2 className="text-xl font-league font-semibold mb-4" style={{ color: 'var(--color-baie-navy)' }}>
            Informations personnelles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Prénom"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
            <Input
              label="Nom"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="mb-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              disabled
              helperText="L'email ne peut pas être modifié"
            />
          </div>

          <div className="mb-4">
            <Input
              label="Téléphone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="06 12 34 56 78"
              helperText="Optionnel"
            />
          </div>
        </Card>

        <Card className="mb-6">
          <h2 className="text-xl font-league font-semibold mb-4" style={{ color: 'var(--color-baie-navy)' }}>
            Profil bénévole
          </h2>

          <div className="mb-4">
            <Input
              label="Compétences"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Ex: Accueil, Billetterie, Technique..."
              helperText="Vos compétences et domaines d'expertise (séparés par des virgules)"
            />
          </div>

          <div className="mb-4">
            <Input
              label="Disponibilités"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Ex: Week-ends, Mercredis soirs..."
              helperText="Quand êtes-vous généralement disponible ?"
            />
          </div>

          <div>
            <Textarea
              label="Biographie"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={!isEditing}
              rows={4}
              placeholder="Parlez-nous un peu de vous..."
              helperText="Optionnel - Présentez-vous en quelques mots"
            />
          </div>
        </Card>

        {authUser && (
          <Card>
            <h2 className="text-xl font-league font-semibold mb-4" style={{ color: 'var(--color-baie-navy)' }}>
              Informations du compte
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold" style={{ color: 'var(--color-baie-navy)' }}>
                  Rôle :
                </span>
                <span className="ml-2">
                  {authUser.role === 'ADMIN' ? 'Administrateur' : 'Bénévole'}
                </span>
              </div>
              <div>
                <span className="font-semibold" style={{ color: 'var(--color-baie-navy)' }}>
                  Membre depuis :
                </span>
                <span className="ml-2">
                  {new Date(authUser.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </Card>
        )}

        {isEditing && (
          <div className="mt-6 flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;
