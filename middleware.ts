// Clerk middleware — protects /dashboard and redirects signed-in users away from homepage
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isHomepage = createRouteMatcher(["/"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();

  // Redirect logged-in users from homepage to dashboard
  if (isHomepage(req)) {
    const { userId } = await auth();
    if (userId) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
