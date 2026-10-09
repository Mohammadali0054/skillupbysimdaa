const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const items = await prisma.cartItem.findMany();
  console.log('Cart Items:', items);
}

main().finally(() => prisma.$disconnect());
