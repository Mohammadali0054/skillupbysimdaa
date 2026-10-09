const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear all enrollments (revenue)
  await prisma.enrollment.deleteMany({});
  console.log("Cleared all enrollments (revenue).");

  // Clear other user-related data
  await prisma.cartItem.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.certificate.deleteMany({});
  console.log("Cleared carts, wishlists, and certificates.");

  // Delete all users except admin
  const result = await prisma.user.deleteMany({
    where: {
      role: {
        not: 'admin'
      }
    }
  });
  console.log(`Deleted ${result.count} users (kept admin).`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
