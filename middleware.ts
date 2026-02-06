import NextAuth from 'next-auth';
import authConfig from './lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
    const isPublicRoute = ['/', '/login', '/signup', '/admin-login'].includes(nextUrl.pathname);
    const isPublicApiRoute = ['/api/register', '/api/webhooks/stripe'].includes(nextUrl.pathname);
    const isAdminRoute = nextUrl.pathname.startsWith('/admin');

    if (isApiAuthRoute || isPublicApiRoute) return NextResponse.next();

    // Prevent middleware from redirecting internal API calls to the login page (GET/POST mismatch)
    if (nextUrl.pathname.startsWith('/api')) return NextResponse.next();

    if (!isLoggedIn && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', nextUrl));
    }

    if (isLoggedIn && isPublicRoute) {
        // Redirect logged in users away from login/signup
        // Redirect based on role
        const role = req.auth?.user?.role;
        if (role === 'SUPERADMIN' || role === 'STAFF') {
            return NextResponse.redirect(new URL('/admin/dashboard', nextUrl));
        }
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }

    // Allow SUPERADMIN and STAFF roles to access admin routes
    const isAdminRole = req.auth?.user?.role === 'SUPERADMIN' || req.auth?.user?.role === 'STAFF';
    if (isLoggedIn && isAdminRoute && !isAdminRole) {
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
