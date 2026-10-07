import { currentUser, createClerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const ADMIN_EMAIL = 'june.licayan@urios.edu.ph';

export default async function AuthRedirectPage() {
  const user = await currentUser();
  if (!user) {
    redirect('/login');
  }

  const email = user.emailAddresses[0]?.emailAddress?.toLowerCase();
  let role = (user.publicMetadata as { role?: string })?.role?.toLowerCase();

  // Secure Server-Side Role Enforcement:
  // ONLY june.licayan@urios.edu.ph receives the Administrator role in Clerk publicMetadata.
  if (email === ADMIN_EMAIL.toLowerCase()) {
    if (role !== 'admin') {
      const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      await client.users.updateUserMetadata(user.id, {
        publicMetadata: { role: 'admin' },
      });
      role = 'admin';
    }
  } else {
    // If any other user somehow has the admin role in metadata, revoke it
    if (role === 'admin') {
      const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      await client.users.updateUserMetadata(user.id, {
        publicMetadata: { role: 'client' },
      });
      role = 'client';
    }
  }

  // Redirect based on the secure Clerk metadata role
  if (role === 'admin') {
    redirect('/admin');
  } else {
    redirect('/dashboard');
  }
}
