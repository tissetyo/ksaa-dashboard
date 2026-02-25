import { db } from '@/lib/db';
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const userId = url.searchParams.get('state'); // We passed userId in the state param
    const error = url.searchParams.get('error');

    const host = req.headers.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/auth/google-callback`;

    if (error) {
        console.error('Google OAuth error:', error);
        return NextResponse.redirect(new URL('/admin/settings?error=google_oauth_declined', req.url));
    }

    if (!code || !userId) {
        return NextResponse.redirect(new URL('/admin/settings?error=missing_auth_params', req.url));
    }

    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUri
        );

        // Exchange authorization code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get the Google user info to store in db (optional but good for tracking)
        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2',
        });
        const { data: userInfo } = await oauth2.userinfo.get();

        // Ensure user actually exists
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.redirect(new URL('/admin/settings?error=user_not_found', req.url));
        }

        // Delete any existing Google account connection for this user
        await db.account.deleteMany({
            where: {
                userId,
                provider: 'google',
            },
        });

        // Insert new Google account tokens
        await db.account.create({
            data: {
                userId,
                type: 'oauth',
                provider: 'google',
                providerAccountId: userInfo.id || tokens.id_token || 'unknown',
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : null,
                token_type: tokens.token_type,
                scope: tokens.scope,
                id_token: tokens.id_token,
            },
        });

        return NextResponse.redirect(new URL('/admin/settings?google_connected=true', req.url));
    } catch (err: any) {
        console.error('Failed to link Google account:', err);
        return NextResponse.redirect(new URL('/admin/settings?error=google_link_failed', req.url));
    }
}
