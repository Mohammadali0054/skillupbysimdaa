const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const enrollments = await prisma.enrollment.findMany({ where: { userId: 4 } });
  enrollments.forEach(e => console.log(e.id));
}

main().finally(() => prisma.$disconnect());
