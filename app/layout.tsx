import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { EmailProvider } from "./providers/EmailContext";
import { ThemeProvider } from "./providers/ThemeProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CSPostHogProvider } from "./provider";
import { UserProvider } from "./providers/UserContext";
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: `Collabute`,
  description: "Shake hands with startups and earn like never before!",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${plusJakarta.className} h-full`}>
        <SpeedInsights />
        <CSPostHogProvider>
          <EmailProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <UserProvider>
                <div className="h-full">
                  {children}
                </div>
              </UserProvider>
            </ThemeProvider>
          </EmailProvider>
        </CSPostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
