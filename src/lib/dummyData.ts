import { Course } from './supabase';

export const dummyCourses: Omit<Course, 'id' | 'created_at'>[] = [
  {
    title: "Complete Web Development Bootcamp",
    description: "Learn to build modern web applications from scratch using HTML, CSS, JavaScript, React, and Node.js.",
    price: 5000,
    thumbnailUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600",
    category: "Web Development",
    instructor: "Sarah Drasner"
  },
  {
    title: "Data Science for Beginners",
    description: "Master data analysis, machine learning, and visualization with Python and Pandas.",
    price: 5000,
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600",
    category: "Data Science",
    instructor: "Andrew Ng"
  },
  {
    title: "UI/UX Design Masterclass",
    description: "A comprehensive guide to designing beautiful interfaces and user experiences using Figma.",
    price: 5000,
    thumbnailUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600",
    category: "Design",
    instructor: "Gary Simon"
  },
  {
    title: "Digital Marketing Strategy",
    description: "Learn SEO, Social Media Marketing, and Google Ads to grow any business online.",
    price: 5000,
    thumbnailUrl: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=600",
    category: "Marketing",
    instructor: "Neil Patel"
  },
  {
    title: "Mastering React 19 and Next.js 15",
    description: "Build incredibly fast and scalable apps with the latest features in the React ecosystem.",
    price: 5000,
    thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=600",
    category: "Web Development",
    instructor: "Lee Robinson"
  },
  {
    title: "Mastering Python for Data and Web",
    description: "From basics to advanced Python, covering Django, Flask, and basic machine learning concepts.",
    price: 5000,
    thumbnailUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&q=80&w=600",
    category: "Programming",
    instructor: "Guido van Rossum"
  },
  {
    title: "SQL Database Masterclass",
    description: "Learn to design, create, and query relational databases with advanced SQL techniques.",
    price: 5000,
    thumbnailUrl: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=600",
    category: "Database",
    instructor: "Michael Stonebraker"
  },
  {
    title: "Power BI Data Visualization",
    description: "Turn your data into interactive dashboards and actionable insights using Microsoft Power BI.",
    price: 5000,
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600",
    category: "Data Analysis",
    instructor: "Will Thompson"
  }
];
