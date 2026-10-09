const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const courses = [
    {
      title: 'Introduction to C',
      description: 'Learn the basics of C programming, variables, loops, and pointers.',
      price: 0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000',
      category: 'C',
      instructor: 'Simdaa Admin'
    },
    {
      title: 'Introduction to C++',
      description: 'Master object-oriented programming with C++ from scratch.',
      price: 0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?q=80&w=1000',
      category: 'C++',
      instructor: 'Simdaa Admin'
    },
    {
      title: 'Introduction to Python',
      description: 'A beginner-friendly introduction to Python programming language.',
      price: 0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000',
      category: 'Python',
      instructor: 'Simdaa Admin'
    },
    {
      title: 'Introduction to Java',
      description: 'Learn Java concepts and start building robust applications.',
      price: 0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000',
      category: 'Java',
      instructor: 'Simdaa Admin'
    },
    {
      title: 'Introduction to SQL',
      description: 'Understand databases, queries, and data management with SQL.',
      price: 0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1000',
      category: 'SQL',
      instructor: 'Simdaa Admin'
    }
  ]

  for (const c of courses) {
    const exists = await prisma.course.findFirst({
      where: { title: c.title }
    })
    
    if (!exists) {
      await prisma.course.create({
        data: c
      })
      console.log(`Created course: ${c.title}`)
    } else {
      console.log(`Course already exists: ${c.title}`)
    }
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
