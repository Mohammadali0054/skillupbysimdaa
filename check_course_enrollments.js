const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    include: { _count: { select: { enrollments: true } } }
  });
  courses.forEach(c => {
    console.log(`Course ${c.id} (${c.title}) has ${c._count.enrollments} enrollments.`);
  });
}

main().finally(() => prisma.$disconnect());
