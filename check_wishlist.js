const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const wish = await prisma.wishlistItem.findMany();
  console.log('Wishlist items:', wish.length);
}

main().finally(() => prisma.$disconnect());
