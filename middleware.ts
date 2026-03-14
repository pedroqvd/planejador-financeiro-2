import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const publicRoutes = [
    '/login',
    '/register',
    '/landing',
    '/forgot-password',
    '/reset-password',
    '/termos',
    '/privacidade',
    '/lgpd',
    '/afiliados/termos'
];

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;
    const isPublicPage = publicRoutes.some(r => pathname.startsWith(r));
    const isApiRoute = pathname.startsWith('/api');
    const isMfaPage = pathname === '/login/mfa';

    // Allow API routes to pass through (they check auth internally)
    if (isApiRoute) return NextResponse.next();

    // Allow the MFA verification page for logged-in users pending MFA
    if (isMfaPage && isLoggedIn) {
        const mfaVerified = req.auth?.user?.mfaVerified;
        // If already verified, redirect to dashboard
        if (mfaVerified === true) {
            return NextResponse.redirect(new URL('/', req.nextUrl));
        }
        return NextResponse.next();
    }

    // Redirect logged-in users away from public pages to dashboard
    if (isPublicPage && isLoggedIn) {
        return NextResponse.redirect(new URL('/', req.nextUrl));
    }

    // Redirect non-logged-in users to landing page
    if (!isPublicPage && !isLoggedIn) {
        return NextResponse.redirect(new URL('/landing', req.nextUrl));
    }

    // Enforce MFA: if user has MFA enabled but not yet verified, redirect to MFA page
    if (isLoggedIn && !isPublicPage) {
        const mfaVerified = req.auth?.user?.mfaVerified;
        if (mfaVerified === false) {
            return NextResponse.redirect(new URL('/login/mfa', req.nextUrl));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
