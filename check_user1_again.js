const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const enrollments = await prisma.enrollment.findMany({ where: { userId: 1 }, include: { course: true }});
  enrollments.forEach(e => console.log(e.course.title));
}

main().finally(() => prisma.$disconnect());
