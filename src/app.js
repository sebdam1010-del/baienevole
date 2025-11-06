const express = require('express');

const app = express();

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de bienvenue
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur la plateforme Baie des Singes',
  });
});

// Route de health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Routes API
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
  });
});

module.exports = app;
