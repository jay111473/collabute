import React from "react";
import { ConvexClientProvider } from "../providers/ConvexClientProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexClientProvider>
        {children}
    </ConvexClientProvider>
  );
}
