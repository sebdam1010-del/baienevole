const { PrismaClient } = require('@prisma/client');

// Singleton pattern pour Prisma Client
// Évite de créer plusieurs instances en développement (hot reload)
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
