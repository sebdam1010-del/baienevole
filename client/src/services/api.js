import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper pour construire l'URL complète d'une image
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // Si l'URL est déjà complète, la retourner telle quelle
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Si le chemin commence déjà par /, c'est un chemin absolu relatif au serveur
  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  // Sinon, ajouter le préfixe /images/
  return `/images/${imagePath}`;
};

export default api;
