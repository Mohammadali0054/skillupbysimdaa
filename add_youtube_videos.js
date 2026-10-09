const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const courseVideoMap = {
  "Data Science for Beginners": {
    title: "Data Analysis with Python Course",
    url: "https://www.youtube.com/watch?v=r-uOLxNrNk8"
  },
  "UI/UX Design Masterclass": {
    title: "Figma UI/UX Design Tutorial",
    url: "https://www.youtube.com/watch?v=c9Wg6Cb_YlU"
  },
  "Digital Marketing Strategy": {
    title: "Digital Marketing Full Course",
    url: "https://www.youtube.com/watch?v=bixR-KIJKYM"
  },
  "Mastering React 19 and Next.js 15": {
    title: "Next.js Full Course",
    url: "https://www.youtube.com/watch?v=ZjAqacIC_3c"
  },
  "Mastering Python for Data and Web": {
    title: "Python for Beginners - Full Course",
    url: "https://www.youtube.com/watch?v=rfscVS0vtbw"
  },
  "Power BI Data Visualization": {
    title: "Power BI Full Course",
    url: "https://www.youtube.com/watch?v=TmhQCQr_DCA"
  },
  "Introduction to C": {
    title: "C Programming Tutorial for Beginners",
    url: "https://www.youtube.com/watch?v=KJgsSFOSQv0"
  },
  "Introduction to C++": {
    title: "C++ Tutorial for Beginners - Full Course",
    url: "https://www.youtube.com/watch?v=vLnPwxZdW4Y"
  },
  "Introduction to Python": {
    title: "Python Tutorial for Beginners",
    url: "https://www.youtube.com/watch?v=kqtD5dpn9C8"
  },
  "Introduction to Java": {
    title: "Java Tutorial for Beginners",
    url: "https://www.youtube.com/watch?v=A74TOX803D0"
  },
  "Introduction to SQL": {
    title: "SQL Tutorial - Full Database Course",
    url: "https://www.youtube.com/watch?v=HXV3zeQKqGY"
  },
  "Web Development Bootcamp": {
    title: "Web Development Full Course",
    url: "https://www.youtube.com/watch?v=nu_pCVPKzTk"
  }
};

async function main() {
  const courses = await prisma.course.findMany({
    include: { lessons: true }
  });

  let addedCount = 0;

  for (const course of courses) {
    if (course.lessons.length === 0) {
      const videoInfo = courseVideoMap[course.title];
      if (videoInfo) {
        console.log(`Adding lesson to course: ${course.title}`);
        await prisma.lesson.create({
          data: {
            courseId: course.id,
            title: videoInfo.title,
            videoUrl: videoInfo.url,
            orderIndex: 1,
            isFreePreview: true,
            contentText: `Enjoy this comprehensive ${course.title} video tutorial!`
          }
        });
        addedCount++;
      } else {
        // Fallback for courses not explicitly mapped
        console.log(`Adding generic fallback lesson to course: ${course.title}`);
        await prisma.lesson.create({
          data: {
            courseId: course.id,
            title: `Introduction to ${course.category || course.title}`,
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // generic placeholder if not found, but we mapped almost all
            orderIndex: 1,
            isFreePreview: true,
            contentText: `Welcome to the ${course.title} course!`
          }
        });
        addedCount++;
      }
    }
  }

  console.log(`\nSuccessfully added lessons to ${addedCount} courses.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
