import NextAuth from 'next-auth';
import authConfig from './lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const role = req.auth?.user?.role;

    const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
    const isPublicRoute = ['/', '/login', '/signup', '/admin-login'].includes(nextUrl.pathname);
    const isPublicApiRoute = ['/api/register', '/api/webhooks/stripe'].includes(nextUrl.pathname);
    const isAdminRoute = nextUrl.pathname.startsWith('/admin');

    // Patient routes: dashboard, appointments, book, book-consultation, profile, services
    const isPatientRoute = ['/dashboard', '/appointments', '/book', '/book-consultation', '/profile', '/services'].some(
        route => nextUrl.pathname === route || nextUrl.pathname.startsWith(route + '/')
    );

    // SUPERADMIN-only admin routes (STAFF cannot access these)
    const isSuperadminOnlyRoute = ['/admin/staff', '/admin/referrals', '/admin/products', '/admin/payments', '/admin/settings'].some(
        route => nextUrl.pathname === route || nextUrl.pathname.startsWith(route + '/')
    );

    if (isApiAuthRoute || isPublicApiRoute) return NextResponse.next();

    // Prevent middleware from redirecting internal API calls to the login page (GET/POST mismatch)
    if (nextUrl.pathname.startsWith('/api')) return NextResponse.next();

    if (!isLoggedIn && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', nextUrl));
    }

    if (isLoggedIn && isPublicRoute) {
        // Redirect logged in users away from login/signup
        // Redirect based on role
        if (role === 'SUPERADMIN' || role === 'STAFF') {
            return NextResponse.redirect(new URL('/admin/dashboard', nextUrl));
        }
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }

    // STAFF can only access admin routes, not patient routes
    if (isLoggedIn && role === 'STAFF' && isPatientRoute) {
        return NextResponse.redirect(new URL('/admin/dashboard', nextUrl));
    }

    // STAFF cannot access SUPERADMIN-only routes
    if (isLoggedIn && role === 'STAFF' && isSuperadminOnlyRoute) {
        return NextResponse.redirect(new URL('/admin/dashboard', nextUrl));
    }

    // Only SUPERADMIN and STAFF can access admin routes
    const isAdminRole = role === 'SUPERADMIN' || role === 'STAFF';
    if (isLoggedIn && isAdminRoute && !isAdminRole) {
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
