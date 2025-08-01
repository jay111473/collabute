import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { EmailProvider } from "./providers/EmailContext";
import { ThemeProvider } from "./providers/ThemeProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CSPostHogProvider } from "./provider";
import { UserProvider } from "./providers/UserContext";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "./providers/ConvexClientProvider";
import Footer from "@/components/footer";
import Header from "@/components/header";

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
    <ConvexAuthNextjsServerProvider>
      <html lang="en" className="h-full">
        <body className={`${spaceGrotesk.className} h-full`}>
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
                    <div className="h-full">
                      <Header />
                      {children}
                      <Footer />
                    </div>
                  </UserProvider>
                </ConvexClientProvider>
              </ThemeProvider>
            </EmailProvider>
          </CSPostHogProvider>
          <Analytics />
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
