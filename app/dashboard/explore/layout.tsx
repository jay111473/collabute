import { Button } from "@/components/ui/button";
import { CircleUser } from "lucide-react";
import React from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col bg-black">
      <header className="flex h-14 justify-between items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
        <h3 className="text-lg ">Explore Projects</h3>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-opacity-50"
        >
          <CircleUser className="h-5 w-5" />
        </Button>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        {children}
      </main>
    </div>
  );
}
