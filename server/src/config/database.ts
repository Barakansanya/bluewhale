// ============================================
// FILE: server/src/config/database.ts
// ============================================
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Named export for consistency
export { prisma };

// Default export for backwards compatibility
export default prisma;