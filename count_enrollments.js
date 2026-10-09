const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const enrollments = await prisma.enrollment.findMany();
  const userCounts = {};
  enrollments.forEach(e => {
    userCounts[e.userId] = (userCounts[e.userId] || 0) + 1;
  });
  console.log(userCounts);
}

main().finally(() => prisma.$disconnect());
