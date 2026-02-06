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
    session: { strategy: 'jwt' },
} satisfies NextAuthConfig;
