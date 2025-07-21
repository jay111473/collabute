"use client";

import { signIn, signOut, useSession } from "@/lib/auth-client";

export function GitHubAuthTest() {
  const { data: session, isPending } = useSession();

  const handleGitHubSignIn = async () => {
    try {
      console.log("🚀 Starting GitHub OAuth flow...");
      const result = await signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });
      console.log("GitHub OAuth result:", result);
    } catch (error) {
      console.error("GitHub OAuth error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log("🚪 Signing out...");
      await signOut();
      console.log("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (isPending) {
    return <div>Loading auth state...</div>;
  }

  return (
    <div className="p-4 border border-gray-300 rounded-md">
      <h3 className="text-lg font-semibold mb-4">GitHub Auth Test</h3>
      
      {session ? (
        <div>
          <p className="mb-2">✅ Signed in as: {session.user.email}</p>
          <p className="mb-2">User ID: {session.user.id}</p>
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-2">❌ Not signed in</p>
          <button
            onClick={handleGitHubSignIn}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Sign In with GitHub
          </button>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Check console for detailed logs</p>
      </div>
    </div>
  );
}