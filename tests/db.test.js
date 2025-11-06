const { PrismaClient } = require('@prisma/client');
const db = require('../src/utils/db');

describe('Database Connection', () => {
  afterAll(async () => {
    // Cleanup: disconnect after all tests
    await db.$disconnect();
  });

  describe('Prisma Client Instance', () => {
    it('should export a valid Prisma Client instance', () => {
      expect(db).toBeDefined();
      expect(typeof db).toBe('object');
      expect(typeof db.$connect).toBe('function');
      expect(typeof db.$disconnect).toBe('function');
      expect(typeof db.$queryRaw).toBe('function');
    });

    it('should be able to execute a raw query', async () => {
      const result = await db.$queryRaw`SELECT 1 as value`;
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Database Connection Health', () => {
    it('should connect to the database successfully', async () => {
      await expect(db.$connect()).resolves.not.toThrow();
    });

    it('should execute a simple query', async () => {
      const result = await db.$queryRaw`SELECT sqlite_version() as version`;
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('version');
    });
  });

  describe('Database Operations', () => {
    it('should be able to perform a transaction', async () => {
      const transaction = db.$transaction([
        db.$queryRaw`SELECT 1 as test`,
      ]);

      await expect(transaction).resolves.not.toThrow();
    });
  });
});
