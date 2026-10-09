import Link from 'next/link';
import { getUserEnrollments, getCurrentUser } from '@/app/actions';
import { redirect } from 'next/navigation';

export default async function MyCoursesPage() {
  const userResult = await getCurrentUser();
  if (!userResult.success || !userResult.user) {
    redirect('/login');
  }

  const result = await getUserEnrollments(userResult.user.id);
  const enrollments = result.success && result.enrollments ? result.enrollments : [];

  return (
    <div style={{ padding: '4rem 2rem', minHeight: '80vh', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>My Learning</h2>
        <Link href="/courses" style={{ color: 'var(--accent-primary)' }}>Browse More Courses →</Link>
      </div>

      {enrollments.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>You haven't purchased any courses yet.</p>
      ) : (
        <div className="courses-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {enrollments.map((enrollment: any) => (
            <div key={enrollment.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '100%', height: '180px' }}>
                <img 
                  src={enrollment.course.thumbnailUrl || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80'} 
                  alt={enrollment.course.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{enrollment.course.category}</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.3 }}>{enrollment.course.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', flex: 1 }}>
                  {enrollment.course.instructor}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <Link href={`/learn/${enrollment.course.id}`} style={{ width: '100%' }}>
                    <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', width: '100%' }}>Start Learning</button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
