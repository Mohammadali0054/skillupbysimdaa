const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user1 = await prisma.user.findUnique({where: {id: 1}});
  const user4 = await prisma.user.findUnique({where: {id: 4}});
  console.log('User 1:', user1.fullName, user1.email);
  console.log('User 4:', user4.fullName, user4.email);
}
main().finally(() => prisma.$disconnect());
