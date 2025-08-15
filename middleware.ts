import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isSignInPage = createRouteMatcher(["/login", "/onboarding"]);
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isAdminLogin = createRouteMatcher(["/admin/login", "/admin/setup"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  // Allow GitHub integration step even when authenticated
  const isGitHubStep = request.nextUrl.searchParams.get("step") === "github";
  
  if (isSignInPage(request) && (await convexAuth.isAuthenticated()) && !isGitHubStep) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }
  if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/login");
  }

  // Admin routes protection - allow login and setup pages without auth
  if (isAdminRoute(request) && !isAdminLogin(request)) {
    if (!(await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/admin/login");
    }
  }
});

export const config = {
  // The following matcher runs middleware on all routes except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
