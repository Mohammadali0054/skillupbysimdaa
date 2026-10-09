import Link from 'next/link';
import { fetchCourses } from '@/app/actions';
import CourseActions from '@/components/CourseActions';

export default async function CoursesPage() {
  const result = await fetchCourses();
  const courses = result.success && result.courses ? result.courses : [];

  return (
    <div style={{ padding: '4rem 2rem', minHeight: '80vh', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Available Courses</h2>
        <Link href="/" style={{ color: 'var(--accent-primary)' }}>← Back to Home</Link>
      </div>

      <div className="courses-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {courses.map(course => (
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
                </div>
                {course.discountedPrice && course.discountEndsAt && new Date(course.discountEndsAt) > new Date() && (
                  <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', fontWeight: 600 }}>
                    Offer Ends: {new Date(course.discountEndsAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              <CourseActions courseId={course.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
