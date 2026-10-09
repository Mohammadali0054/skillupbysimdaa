const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { _count: { select: { enrollments: true } } }
  });
  users.forEach(u => {
    console.log(`User ${u.id} (${u.email}) has ${u._count.enrollments} enrollments.`);
  });
}

main().finally(() => prisma.$disconnect());
