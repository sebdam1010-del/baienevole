import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav style={{ backgroundColor: 'var(--color-baie-navy)' }} className="text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl" style={{ fontFamily: 'var(--font-family-protest)' }}>
                🐒 Baie des Singes
              </Link>
              <div className="flex space-x-4">
                <Link
                  to="/"
                  className="hover:opacity-80 transition-opacity"
                >
                  Événements
                </Link>
                <Link
                  to="/dashboard"
                  className="hover:opacity-80 transition-opacity"
                >
                  Mon tableau de bord
                </Link>
                {isAdmin() && (
                  <Link
                    to="/admin/events"
                    className="hover:opacity-80 transition-opacity font-semibold"
                  >
                    Administration
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="hover:opacity-80 transition-opacity"
              >
                {user?.firstName} {user?.lastName}
              </Link>
              <button
                onClick={handleLogout}
                style={{ backgroundColor: 'var(--color-baie-red)' }}
                className="hover:opacity-90 px-4 py-2 rounded transition-opacity"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer style={{ backgroundColor: 'var(--color-baie-navy)' }} className="text-white py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} La Baie des Singes - Plateforme de gestion des bénévoles</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
