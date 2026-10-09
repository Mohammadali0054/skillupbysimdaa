const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: 1 },
    include: { course: true }
  });
  console.log(`User 1 has ${enrollments.length} enrollments.`);
  enrollments.forEach((e, idx) => {
    console.log(`${idx + 1}. Course ID: ${e.courseId}, Title: ${e.course ? e.course.title : 'NULL'}`);
  });
}

main().finally(() => prisma.$disconnect());
