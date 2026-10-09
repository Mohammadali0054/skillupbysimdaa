const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    include: { _count: { select: { lessons: true } } }
  });
  courses.forEach(c => {
    if (c._count.lessons > 0) console.log(`Course ${c.id} (${c.title}) has ${c._count.lessons} lessons.`);
  });
}

main().finally(() => prisma.$disconnect());
