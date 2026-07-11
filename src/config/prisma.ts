// From src/config/prisma.ts, the generated client is at ../generated/prisma
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export default prisma;