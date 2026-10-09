const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      enrollments: {
        include: { course: true }
      }
    }
  });
  
  users.forEach(u => {
    console.log(`User ${u.id} (${u.email}) has ${u.enrollments.length} enrollments.`);
    console.log(`  Active enrollments: ${u.enrollments.filter(e => e.isActive).length}`);
    console.log(`  Courses published: ${u.enrollments.filter(e => e.course && e.course.isPublished).length}`);
  });
}

main().finally(() => prisma.$disconnect());
