const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'test9courses@example.com',
      password: hashedPassword,
      fullName: 'Test 9 Courses',
      role: 'student'
    }
  });

  const courses = await prisma.course.findMany({ take: 9 });
  const enrollments = courses.map(c => ({
    userId: user.id,
    courseId: c.id,
    pricePaid: 0,
    discount: c.price,
    isActive: true
  }));

  await prisma.enrollment.createMany({ data: enrollments });
  console.log(`Created user ${user.id} and enrolled in 9 courses.`);
}

main().finally(() => prisma.$disconnect());
