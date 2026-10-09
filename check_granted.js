const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const enrollments = await prisma.enrollment.findMany();
  const granted = {};
  enrollments.forEach(e => {
    if (e.pricePaid === 0 && e.discount > 0) {
      granted[e.userId] = (granted[e.userId] || 0) + 1;
    }
  });
  console.log('Granted courses (pricePaid=0, discount>0):', granted);
}

main().finally(() => prisma.$disconnect());
