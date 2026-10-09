const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    orderBy: { id: 'asc' }
  });
  console.log(`Total courses: ${courses.length}`);
  courses.forEach(c => {
    console.log(`ID: ${c.id}, Title: ${c.title}, Published: ${c.isPublished}`);
  });
}

main().finally(() => prisma.$disconnect());
