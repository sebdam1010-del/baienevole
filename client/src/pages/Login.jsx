import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Button, Card } from '../components/ui';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    // Clear error for this field
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
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      setApiError(
        error.response?.data?.error ||
        'Erreur de connexion. Vérifiez vos identifiants.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-4xl mb-2"
            style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
          >
            🐒 Baie des Singes
          </h1>
          <p className="text-gray-600">Plateforme de gestion des bénévoles</p>
        </div>

        <Card>
          <h2
            className="text-2xl mb-6 text-center"
            style={{ fontFamily: 'var(--font-family-protest)', color: 'var(--color-baie-navy)' }}
          >
            Connexion
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
              label="Mot de passe"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Pas encore de compte ? </span>
            <Link
              to="/register"
              className="font-semibold hover:underline"
              style={{ color: 'var(--color-baie-red)' }}
            >
              S'inscrire
            </Link>
          </div>

          <div
            className="mt-4 p-3 rounded text-xs"
            style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
          >
            <p className="font-semibold mb-1">Comptes de test :</p>
            <p>Admin : admin@baiedessinges.com / admin123</p>
            <p>Bénévole : benevole1@example.com / volunteer123</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
