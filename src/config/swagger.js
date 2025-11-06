const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'La Baie des Singes - API de Gestion des Bénévoles',
      version: '1.0.0',
      description: 'API RESTful pour la gestion des bénévoles et des événements de La Baie des Singes',
      contact: {
        name: 'La Baie des Singes',
        url: 'https://github.com/sebdam1010-del/baienevole',
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement',
      },
      {
        url: 'https://api.baiedessinges.com',
        description: 'Serveur de production',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenu via /api/auth/login',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            id: {
              type: 'string',
              description: 'ID unique de l\'utilisateur',
              example: 'clm1234567890',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email de l\'utilisateur',
              example: 'marie.dupont@example.com',
            },
            firstName: {
              type: 'string',
              description: 'Prénom',
              example: 'Marie',
            },
            lastName: {
              type: 'string',
              description: 'Nom',
              example: 'Dupont',
            },
            phone: {
              type: 'string',
              description: 'Numéro de téléphone',
              example: '0612345678',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'VOLUNTEER'],
              description: 'Rôle de l\'utilisateur',
              example: 'VOLUNTEER',
            },
            skills: {
              type: 'string',
              description: 'Compétences (séparées par virgule)',
              example: 'Accueil,Billetterie',
            },
            availability: {
              type: 'string',
              description: 'Disponibilités',
              example: 'Week-ends',
            },
            bio: {
              type: 'string',
              description: 'Biographie',
              example: 'Passionnée de théâtre',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière mise à jour',
            },
          },
        },
        Event: {
          type: 'object',
          required: ['nom', 'date', 'horaireArrivee', 'horaireDepart', 'nombreBenevolesRequis', 'saison'],
          properties: {
            id: {
              type: 'string',
              description: 'ID unique de l\'événement',
              example: 'clm9876543210',
            },
            nom: {
              type: 'string',
              description: 'Nom de l\'événement',
              example: 'Concert acoustique',
            },
            description: {
              type: 'string',
              description: 'Description de l\'événement',
              example: 'Concert en plein air avec artistes locaux',
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Date de l\'événement (YYYY-MM-DD)',
              example: '2025-12-25',
            },
            horaireArrivee: {
              type: 'string',
              pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
              description: 'Heure d\'arrivée (HH:MM)',
              example: '18:30',
            },
            horaireDepart: {
              type: 'string',
              pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
              description: 'Heure de départ (HH:MM)',
              example: '22:00',
            },
            nombreSpectatursAttendus: {
              type: 'integer',
              minimum: 0,
              description: 'Nombre de spectateurs attendus',
              example: 200,
            },
            nombreBenevolesRequis: {
              type: 'integer',
              minimum: 1,
              description: 'Nombre de bénévoles requis',
              example: 8,
            },
            saison: {
              type: 'integer',
              minimum: 1,
              description: 'Numéro de saison (septembre à juin)',
              example: 29,
            },
            commentaires: {
              type: 'string',
              description: 'Commentaires additionnels',
              example: 'Annulation si pluie',
            },
            registrations: {
              type: 'array',
              description: 'Liste des inscriptions',
              items: {
                $ref: '#/components/schemas/Registration',
              },
            },
            quotaStatus: {
              type: 'object',
              description: 'Statut du quota d\'inscription',
              properties: {
                color: {
                  type: 'string',
                  enum: ['green', 'orange', 'red'],
                  description: 'Couleur du statut (vert: OK, orange: +1-2, rouge: +3+)',
                  example: 'green',
                },
                code: {
                  type: 'string',
                  description: 'Code couleur hexadécimal',
                  example: '#ABD4A9',
                },
                registered: {
                  type: 'integer',
                  description: 'Nombre d\'inscrits',
                  example: 5,
                },
                required: {
                  type: 'integer',
                  description: 'Nombre requis',
                  example: 8,
                },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Registration: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID unique de l\'inscription',
            },
            eventId: {
              type: 'string',
              description: 'ID de l\'événement',
            },
            userId: {
              type: 'string',
              description: 'ID de l\'utilisateur',
            },
            user: {
              $ref: '#/components/schemas/User',
              description: 'Informations du bénévole inscrit',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date d\'inscription',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Message d\'erreur',
              example: 'Resource not found',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints d\'authentification (login, register)',
      },
      {
        name: 'Events',
        description: 'Gestion des événements',
      },
      {
        name: 'Registration',
        description: 'Inscription/désinscription aux événements',
      },
      {
        name: 'Admin',
        description: 'Endpoints d\'administration (admins uniquement)',
      },
      {
        name: 'Profile',
        description: 'Gestion du profil utilisateur',
      },
      {
        name: 'Dashboard',
        description: 'Tableau de bord et statistiques',
      },
      {
        name: 'Volunteers',
        description: 'Gestion des bénévoles (admins)',
      },
    ],
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
  ],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
