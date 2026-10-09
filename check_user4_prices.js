const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: 4 },
    include: { course: true }
  });
  enrollments.forEach((e) => {
    console.log(`Course: ${e.course.title}, pricePaid: ${e.pricePaid}, discount: ${e.discount}, coursePrice: ${e.course.price}`);
  });
}

main().finally(() => prisma.$disconnect());
