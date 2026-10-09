const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const inactive = await prisma.enrollment.findMany({ where: { isActive: false } });
  console.log('Inactive enrollments:', inactive.length);
}

main().finally(() => prisma.$disconnect());
