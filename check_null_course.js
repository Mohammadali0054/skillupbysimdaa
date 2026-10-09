const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const enrollments = await prisma.enrollment.findMany({ include: { course: true } });
  const nullCourses = enrollments.filter(e => !e.course);
  console.log('Null courses:', nullCourses.length);
}

main().finally(() => prisma.$disconnect());
