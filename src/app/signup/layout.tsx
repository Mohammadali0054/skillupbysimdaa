import { getCurrentUser } from '@/app/actions';
import { redirect } from 'next/navigation';

export default async function SignupLayout({ children }: { children: React.ReactNode }) {
  const result = await getCurrentUser();
  if (result.success && result.user) {
    redirect('/courses');
  }
  return <>{children}</>;
}
