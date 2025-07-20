import { betterAuth } from "better-auth";
import { convex } from "@convex-dev/better-auth/plugins";

type User = any;
type Account = any;

const siteUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

export const auth = betterAuth({
  baseURL: siteUrl,
  secret: process.env.BETTER_AUTH_SECRET || "your-secret-key",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  plugins: [
    convex({
      // Configure the Convex plugin with necessary options
    }),
  ],
  callbacks: {
    async signIn({ user, account }: { user: User; account: Account }) {
      return true;
    },
    async signUp({ user }: { user: User }) {
      return true;
    },
  },
});

export type Session = typeof auth.$Infer.Session;
