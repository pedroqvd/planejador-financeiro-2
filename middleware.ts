import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const publicRoutes = ['/login', '/register', '/landing', '/forgot-password', '/reset-password'];

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;
    const isPublicPage = publicRoutes.some(r => pathname.startsWith(r));
    const isApiRoute = pathname.startsWith('/api');

    // Allow API routes to pass through
    if (isApiRoute) return NextResponse.next();

    // Redirect logged-in users away from public pages to dashboard
    if (isPublicPage && isLoggedIn) {
        return NextResponse.redirect(new URL('/', req.nextUrl));
    }

    // Redirect non-logged-in users to landing page
    if (!isPublicPage && !isLoggedIn) {
        return NextResponse.redirect(new URL('/landing', req.nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
