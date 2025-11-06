const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (images d'événements)
app.use('/images', express.static('public/images'));

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

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Baie des Singes API Docs',
}));

// Routes API
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const eventsRoutes = require('./routes/eventsRoutes');
const profileRoutes = require('./routes/profileRoutes');
const volunteersRoutes = require('./routes/volunteersRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/volunteers', volunteersRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
  });
});

module.exports = app;
