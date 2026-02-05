import NextAuth from 'next-auth';
import authConfig from './lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth({
    ...authConfig,
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            if (token.role && session.user) {
                session.user.role = token.role as "SUPERADMIN" | "PATIENT";
            }
            return session;
        },
        async jwt({ token }) {
            return token;
        },
    },
});

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
    const isPublicRoute = ['/', '/login', '/signup', '/admin-login'].includes(nextUrl.pathname);
    const isAdminRoute = nextUrl.pathname.startsWith('/admin');

    if (isApiAuthRoute) return NextResponse.next();

    if (!isLoggedIn && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', nextUrl));
    }

    if (isLoggedIn && isPublicRoute) {
        // Redirect logged in users away from login/signup
        // Default to dashboard based on role?
        const role = req.auth?.user?.role;
        if (role === 'SUPERADMIN') {
            return NextResponse.redirect(new URL('/admin/dashboard', nextUrl));
        }
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }

    if (isLoggedIn && isAdminRoute && req.auth?.user?.role !== 'SUPERADMIN') {
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
