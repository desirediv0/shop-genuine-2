import { NextResponse } from "next/server";

// Define private routes that require authentication
const privateRoutes = ["/profile", "/checkout", "/wishlist", "/orders"];

// Web access is blocked on these routes; users see the app download page instead
const appOnlyRoutes = ["/products", "/wishlist", "/account", "/profile"];

export function middleware(request) {
    const { pathname } = request.nextUrl;

    const isAppOnly =
        pathname === "/" ||
        appOnlyRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));
    if (isAppOnly) {
        return NextResponse.rewrite(new URL("/get-app", request.url));
    }

    // Get the authentication cookie
    const isAuthenticated =
        request.cookies.has("accessToken") || request.cookies.has("user_session");

    // Check if the path is a private route
    const isPrivateRoute = privateRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // If accessing a private route without authentication, redirect to login
    if (isPrivateRoute && !isAuthenticated) {
        return NextResponse.redirect(new URL("/auth", request.url));
    }

    // Auth pages (login, OTP, reset, forgot) stay open to everyone: the mobile app links to them

    return NextResponse.next();
}

// Configure the paths that middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images/ (app's images)
         * - public/ (public files)
         * - api/ (API routes)
         */
        "/((?!_next/static|_next/image|favicon.ico|images|public|api).*)",
    ],
};
