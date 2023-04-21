import { PrismaClient } from '@prisma/client'

const debugPrisma = process.env.DEBUG?.includes('prisma')

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: debugPrisma ? ['query', 'error', 'warn'] : ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.CONNECTION_POOL_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
