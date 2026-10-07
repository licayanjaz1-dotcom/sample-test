import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/sign-in(.*)',
  '/_next(.*)',
  '/favicon.ico',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // 1. Authenticate non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // 2. Server-side protection for /admin routes
  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }

    // Check role in Clerk session claims first (fastest)
    const claims = sessionClaims as Record<string, any> | undefined;
    const roleFromClaims = (
      claims?.metadata?.role ||
      claims?.public_metadata?.role ||
      claims?.role
    )?.toString().toLowerCase();

    let isAdmin = roleFromClaims === 'admin';

    // Verify against Clerk Backend API to ensure up-to-date metadata
    if (!isAdmin) {
      try {
        const { createClerkClient } = await import('@clerk/nextjs/server');
        const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const user = await client.users.getUser(userId);
        const metadataRole = (user.publicMetadata as { role?: string })?.role?.toLowerCase();
        isAdmin = metadataRole === 'admin';
      } catch (err) {
        console.error('Error verifying admin metadata in middleware:', err);
        isAdmin = false;
      }
    }

    // If not an Administrator, deny access and redirect to /dashboard
    if (!isAdmin) {
      const dashboardUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
