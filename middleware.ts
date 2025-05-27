import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Si l'utilisateur essaie d'accéder à l'administration
    if (path.startsWith("/administration")) {
      // Vérifier si l'utilisateur a le rôle ADMIN
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
      // Si l'utilisateur est admin, on le laisse accéder à la page
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/administration/:path*"],
};
