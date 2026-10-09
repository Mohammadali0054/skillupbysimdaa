import { getUserCertificates } from '@/app/actions';
import { redirect } from 'next/navigation';
import { Certificate } from '@/components/Certificate';
import Link from 'next/link';

export default async function MyCertificatesPage() {
  const result = await getUserCertificates();

  if (!result.success && result.error === 'Not logged in') {
    redirect('/login');
  }

  const certificates = result.certificates || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
          <Link href="/my-courses" className="text-blue-600 hover:underline font-medium">
            Back to My Courses
          </Link>
        </div>

        {certificates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Certificates Yet</h2>
            <p className="text-gray-500 mb-6">Complete a course to earn your first certificate!</p>
            <Link href="/courses" className="inline-block bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            {certificates.map((cert: any) => (
              <div key={cert.id} className="flex flex-col items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="w-full overflow-hidden flex justify-center mb-6">
                  {/* Scale down the certificate so it fits nicely in a grid */}
                  <div className="origin-top scale-[0.45] sm:scale-[0.6] md:scale-[0.7] lg:scale-[0.8] xl:scale-[0.55] transition-transform" style={{ height: '390px' }}>
                    <Certificate
                      studentName={cert.user?.fullName || 'Student'}
                      courseTitle={cert.course?.title || 'Course'}
                      instructorName={cert.course?.instructor || 'Instructor'}
                      totalHours={cert.course?.lessons?.length || 10}
                      completedAt={new Date(cert.issuedAt)}
                      certificateId={cert.certificateId}
                      courseId={cert.courseId.toString()}
                    />
                  </div>
                </div>
                <div className="w-full text-center mt-[-40px]">
                  <h3 className="font-semibold text-lg text-gray-900">{cert.course?.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">Issued: {new Date(cert.issuedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
