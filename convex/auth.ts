import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";
import { httpAction } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [GitHub],
});
