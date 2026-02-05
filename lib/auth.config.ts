import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// This config is safe for Edge/Middleware (no database imports)
export default {
    providers: [
        Credentials({
            // The authorize function here is a placeholder for Edge
            // The real logic with DB access lives in lib/auth.ts
            async authorize(credentials) {
                return null;
            },
        }),
    ],
} satisfies NextAuthConfig;
