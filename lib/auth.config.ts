import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// This config is safe for Edge/Middleware (no database imports)
export default {
    providers: [
        Credentials({
            async authorize(credentials) {
                return null;
            },
        }),
    ],
    callbacks: {
        session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            if (token.role && session.user) {
                session.user.role = token.role as any;
            }
            return session;
        },
        jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
            }
            return token;
        },
    },
    session: { strategy: 'jwt' },
    pages: {
        signIn: '/login',
    },
    secret: process.env.AUTH_SECRET,
    trustHost: true,
} satisfies NextAuthConfig;
