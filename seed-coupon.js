const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const coupon = await prisma.coupon.upsert({
    where: { code: 'DISCOUNT50' },
    update: {},
    create: {
      code: 'DISCOUNT50',
      discountPercent: 50,
      maxUses: 100,
    },
  })
  console.log({ coupon })
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
