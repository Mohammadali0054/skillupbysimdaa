import Link from "next/link";
import styles from "./page.module.css";
import { fetchCourses } from '@/app/actions';
import Image from 'next/image';

const categories = [
  { name: "Web Development", icon: <CodeIcon /> },
  { name: "Data Science", icon: <DataIcon /> },
  { name: "Design", icon: <DesignIcon /> },
  { name: "Marketing", icon: <MarketingIcon /> },
  { name: "Business", icon: <BusinessIcon /> },
  { name: "Photography", icon: <PhotoIcon /> },
  { name: "Music", icon: <MusicIcon /> },
  { name: "Personal Dev", icon: <PersonIcon /> },
];

export const revalidate = 60; // Revalidate cache every 60 seconds

export default async function Home() {
  // Fetch courses from SQL Server via Server Action
  let featuredCourses: any[] = [];
  let dbError = false;

  try {
    const result = await fetchCourses();
    if (result.success && result.courses) {
      // get the latest 6 courses
      featuredCourses = result.courses.slice(0, 6);
    } else {
      dbError = true;
    }
  } catch (e) {
    console.error("Database connection error:", e);
    dbError = true;
  }

  return (
    <div className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}></div>
        <div className={`container ${styles.heroContainer}`}>
          <h1 className={styles.heroTitle}>
            Unlock Your Potential with <br />
            <span className="gradient-text">SimdaaLearn</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Learn from industry experts, build your portfolio, and accelerate your career. 
            Join millions of learners worldwide and start your journey today.
          </p>
          <div className={styles.heroActions}>
            <Link href="/courses" className="btn btn-primary">
              Explore Courses
            </Link>
            <Link href="/signup" className="btn btn-secondary">
              Start for Free
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Courses from Supabase */}
      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Featured Courses</h2>
          <p className={styles.sectionSubtitle}>Hand-picked courses to kickstart your career.</p>
        </div>
        
        {dbError ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Database Not Connected</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              We couldn't fetch the courses. Please make sure your <code>.env.local</code> is set up and the database is seeded.
            </p>
            <Link href="/admin" className="btn btn-primary">Go to Admin Portal</Link>
          </div>
        ) : featuredCourses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>No courses found. Go seed the database!</p>
            <Link href="/admin" className="btn btn-primary">Seed Database</Link>
          </div>
        ) : (
          <div className="courses-grid">
            {featuredCourses.map((course) => (
              <div key={course.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ position: 'relative', width: '100%', height: '180px' }}>
                  <img 
                    src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80'} 
                    alt={course.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{course.category}</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.3 }}>{course.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', flex: 1 }}>
                    {course.instructor}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {course.discountedPrice && course.discountEndsAt && new Date(course.discountEndsAt) > new Date() ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)' }}>₹{course.discountedPrice.toFixed(2)}</span>
                            <span style={{ background: '#dcfce3', color: '#166534', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                              {Math.round(((course.price - course.discountedPrice) / course.price) * 100)}% OFF
                            </span>
                          </div>
                          <span style={{ textDecoration: 'line-through', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>₹{course.price.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{course.price.toFixed(2)}</span>
                      )}
                      <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Enroll</button>
                    </div>
                    {course.discountedPrice && course.discountEndsAt && new Date(course.discountEndsAt) > new Date() && (
                      <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', fontWeight: 600 }}>
                        Offer Ends: {new Date(course.discountEndsAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Top Categories</h2>
          <p className={styles.sectionSubtitle}>Discover the most popular topics chosen by our learners.</p>
        </div>
        
        <div className={styles.categoryGrid}>
          {categories.map((cat, index) => (
            <div key={index} className={styles.categoryCard}>
              <div className={styles.categoryIcon}>
                {cat.icon}
              </div>
              <span className={styles.categoryName}>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// Inline SVGs for Categories to avoid dependencies
function CodeIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
}
function DataIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
}
function DesignIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
}
function MarketingIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 18h2"/><path d="m21.9 8.3-2.1-1.2c-1-.6-2.3-.3-2.9.7l-4 6.7c-.6 1-.3 2.3.7 2.9l2.1 1.2c1 .6 2.3.3 2.9-.7l4-6.7c.6-1 .3-2.3-.7-2.9z"/><path d="M2.5 10c-.8 0-1.5.7-1.5 1.5v3c0 .8.7 1.5 1.5 1.5h2.5c.8 0 1.5-.7 1.5-1.5v-3c0-.8-.7-1.5-1.5-1.5h-2.5z"/><path d="M6.5 13h4.6"/></svg>
}
function BusinessIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
}
function PhotoIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
}
function MusicIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
}
function PersonIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
