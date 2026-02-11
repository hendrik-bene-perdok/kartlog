import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const sessionCookie = request.cookies.get('__session');
    const { pathname } = request.nextUrl;

    // 1. Protect /app routes (and any subpaths)
    if (pathname.startsWith('/app')) {
        if (!sessionCookie) {
            // Redirect to login if no session cookie
            // We append the original URL as a redirect param
            const loginUrl = new URL('/login', request.url);
            // We skip setting the redirect if it's just the default app route to avoid loops or unnecessary params
            if (pathname !== '/app') {
                loginUrl.searchParams.set('redirect', pathname);
            }
            return NextResponse.redirect(loginUrl);
        }
    }

    // 2. Redirect authenticated users away from /login
    if (pathname === '/login') {
        if (sessionCookie) {
            // If already logged in, go to app
            return NextResponse.redirect(new URL('/app/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
