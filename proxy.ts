import { clerkMiddleware } from "@clerk/nextjs/server"

// Clerk n'est utilisé que dans l'espace de modération (/admin) : le middleware
// ne traite donc que ses routes + les pages d'authentification associées.
export default clerkMiddleware()

export const config = {
  matcher: [
    "/admin/:path*",
    "/sign-in/:path*",
    "/sign-up/:path*",
  ],
}