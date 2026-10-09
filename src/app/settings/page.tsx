import { getCurrentUser } from '@/app/actions';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const userResult = await getCurrentUser();
  if (!userResult.success || !userResult.user) {
    redirect('/login');
  }

  return (
    <div style={{ padding: '4rem 2rem', minHeight: '80vh', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Account Settings</h2>
      <SettingsClient user={userResult.user} />
    </div>
  );
}
