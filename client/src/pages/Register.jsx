import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Button, Card } from '../components/ui';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.firstName) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Le nom est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const { confirmPassword, ...registrationData } = formData;
      await register(registrationData);
      navigate('/');
    } catch (error) {
      setApiError(
        error.response?.data?.error ||
        'Erreur lors de l\'inscription. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-4xl mb-2"
            style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
          >
            🐒 Baie des Singes
          </h1>
          <p className="text-gray-600">Rejoignez notre équipe de bénévoles</p>
        </div>

        <Card>
          <h2
            className="text-2xl mb-6 text-center"
            style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
          >
            Inscription
          </h2>

          {apiError && (
            <div
              className="mb-4 p-3 rounded border text-sm"
              style={{
                backgroundColor: '#FEE2E2',
                borderColor: 'var(--color-baie-red)',
                color: 'var(--color-baie-red)',
              }}
            >
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                placeholder="Jean"
                required
                autoComplete="given-name"
              />

              <Input
                label="Nom"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                placeholder="Dupont"
                required
                autoComplete="family-name"
              />
            </div>

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="votre.email@exemple.com"
              required
              autoComplete="email"
            />

            <Input
              label="Téléphone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="06 12 34 56 78"
              helperText="Optionnel"
              autoComplete="tel"
            />

            <Input
              label="Mot de passe"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              helperText="Minimum 6 caractères"
              required
              autoComplete="new-password"
            />

            <Input
              label="Confirmer le mot de passe"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Inscription...' : 'S\'inscrire'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Déjà un compte ? </span>
            <Link
              to="/login"
              className="font-semibold hover:underline"
              style={{ color: 'var(--color-baie-red)' }}
            >
              Se connecter
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
