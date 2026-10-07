import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AdminDashboardView from './AdminDashboardView';

export default async function AdminPage() {
  const user = await currentUser();

  // 1. Unauthenticated users must not access /admin
  if (!user) {
    redirect('/login');
  }

  // 2. Server-side role check:
  // ONLY users with 'admin' in their Clerk publicMetadata can access /admin
  const role = (user.publicMetadata as { role?: string })?.role?.toLowerCase();
  if (role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <AdminDashboardView
      adminEmail={user.emailAddresses[0]?.emailAddress || 'june.licayan@urios.edu.ph'}
      adminName={user.fullName || 'Executive Administrator'}
    />
  );
}
