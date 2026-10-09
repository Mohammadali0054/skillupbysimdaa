import { getCourseForLearning, getCurrentUser, getCertificateData } from '@/app/actions';
import { redirect } from 'next/navigation';
import LearnPortal from './LearnPortal';

export default async function LearnPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId: courseIdStr } = await params;
  const courseId = parseInt(courseIdStr, 10);

  
  if (isNaN(courseId)) {
    redirect('/my-courses');
  }

  const userResult = await getCurrentUser();
  const user = userResult.success ? userResult.user : null;

  const result = await getCourseForLearning(courseId);

  let initialCertificate = null;
  if (user) {
    const certResult = await getCertificateData(courseId);
    if (certResult.success && certResult.certificate) {
      initialCertificate = certResult.certificate;
    }
  }

  if (!result.success || !result.course) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', minHeight: '80vh' }}>
        <h2>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
          {result.error || 'You are not enrolled in this course or it does not exist.'}
        </p>
        <a href="/my-courses" className="btn btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>
          Return to My Courses
        </a>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)' }}>
      <LearnPortal course={result.course} user={user} initialCertificate={initialCertificate} />
    </div>
  );
}
