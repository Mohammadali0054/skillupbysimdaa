import { getCertificateById } from '@/app/actions';
import { Certificate } from '@/components/Certificate';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';

export default async function VerifyCertificatePage({ params }: { params: Promise<{ certificateId: string }> }) {
  const { certificateId } = await params;
  
  const result = await getCertificateById(certificateId);

  if (!result.success || !result.certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border-t-4 border-red-500">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
          <p className="text-gray-500 mb-6">We couldn't find a valid certificate with the ID "{certificateId}".</p>
          <Link href="/" className="inline-block bg-gray-900 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const { certificate } = result;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-[1000px] w-full mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row items-center justify-between border-l-4 border-green-500">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Certificate Verified</h1>
              <p className="text-sm text-gray-500">This is an authentic certificate issued by simdaa Learning.</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">Issued to: <span className="font-bold">{certificate.user?.fullName}</span></div>
            <div className="text-xs text-gray-500 mt-1">Issued on: {new Date(certificate.issuedAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
      
      <div className="w-full overflow-x-auto pb-8 flex justify-center">
        <div className="scale-75 sm:scale-90 md:scale-100 origin-top">
          <Certificate
            studentName={certificate.user?.fullName || 'Student'}
            courseTitle={certificate.course?.title || 'Course'}
            instructorName={certificate.course?.instructor || 'Instructor'}
            totalHours={certificate.course?.lessons?.length || 10} // fallback
            completedAt={new Date(certificate.issuedAt)}
            certificateId={certificate.certificateId}
            courseId={certificate.courseId.toString()}
          />
        </div>
      </div>
    </div>
  );
}
