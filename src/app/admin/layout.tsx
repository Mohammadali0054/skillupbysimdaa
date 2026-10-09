import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;

  if (!sessionId) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(sessionId) }
  });

  if (!user || user.role !== 'admin' || !user.isActive) {
    redirect('/login');
  }

  return <>{children}</>;
}
