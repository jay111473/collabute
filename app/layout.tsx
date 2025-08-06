import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { EmailProvider } from "./providers/EmailContext";
import { ThemeProvider } from "./providers/ThemeProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CSPostHogProvider } from "./provider";
import { UserProvider } from "./providers/UserContext";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { ConvexClientProvider } from "./providers/ConvexClientProvider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: `Collabute`,
  description: "Shake hands with startups and earn like never before!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} h-full`}>
        <ConvexAuthNextjsServerProvider>
          <SpeedInsights />
          <CSPostHogProvider>
            <EmailProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <ConvexClientProvider>
                  <UserProvider>
                    <LayoutWrapper>
                      {children}
                    </LayoutWrapper>
                  </UserProvider>
                </ConvexClientProvider>
              </ThemeProvider>
            </EmailProvider>
          </CSPostHogProvider>
          <Analytics />
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
