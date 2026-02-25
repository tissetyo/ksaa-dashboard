import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import authConfig from './auth.config';
import { UserRole } from '@prisma/client';

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    adapter: PrismaAdapter(db),
    ...authConfig,
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
            }

            if (!token.sub) return token;

            try {
                const existingUser = await db.user.findUnique({
                    where: { id: token.sub },
                });

                if (existingUser) {
                    token.role = existingUser.role;
                }
            } catch (error: any) {
                console.error('[AUTH_DB_ERROR] Database check failed, using token data:', error?.message);
            }

            return token;
        },
    },
    providers: [
        Credentials({
            async authorize(credentials) {
                try {
                    console.log('[AUTH_DEBUG] Authorize called with:', { email: credentials?.email });

                    if (!credentials?.email || !credentials?.password) {
                        console.log('[AUTH_DEBUG] Missing credentials');
                        return null;
                    }

                    const normalizedEmail = (credentials.email as string).toLowerCase();
                    const user = await db.user.findUnique({
                        where: { email: normalizedEmail },
                    });

                    if (!user) {
                        console.log('[AUTH_DEBUG] User not found');
                        return null;
                    }

                    if (!user.password) {
                        console.log('[AUTH_DEBUG] User has no password set');
                        return null;
                    }

                    const bcrypt = require('bcryptjs');
                    const passwordsMatch = await bcrypt.compare(
                        credentials.password as string,
                        user.password
                    );

                    console.log('[AUTH_DEBUG] Password match result:', passwordsMatch);

                    if (passwordsMatch) return user;

                    console.log('[AUTH_DEBUG] Password mismatch');
                    return null;
                } catch (error) {
                    console.error('[AUTH_DEBUG] Authorize error:', error);
                    return null;
                }
            },
        }),
    ],
});
