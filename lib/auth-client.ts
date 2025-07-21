import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [convexClient()],
});

// Export the hooks from the auth client
export const {
  useSession,
  signIn,
  signOut,
  signUp,
} = authClient;
