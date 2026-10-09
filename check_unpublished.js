const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const unpublished = await prisma.course.findMany({
    where: { isPublished: false }
  });
  console.log('Unpublished courses:', unpublished.length);
}

main().finally(() => prisma.$disconnect());
