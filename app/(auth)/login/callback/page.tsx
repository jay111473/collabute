"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setCookie } from "cookies-next";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        setCookie("token", token);
        const redirectTimer = setTimeout(() => {
          router.push("/dashboard");
        }, 1500); // Add a small delay for better UX

        return () => clearTimeout(redirectTimer);
      } catch (error) {
        setIsLoading(false);
        console.error("Authentication error:", error);
      }
    } else {
      setIsLoading(false);
    }
  }, [token, router]);

  if (!token) {
    return (
      <div className="w-full max-w-md space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Authentication Failed</AlertTitle>
          <AlertDescription>
            No authentication token was found. Please try logging in again.
          </AlertDescription>
        </Alert>
        <Button className="w-full" onClick={() => router.push("/login")}>
          Return to Login
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-primary/10" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Authentication Successful
            </h2>
            <p className="text-muted-foreground">
              Please wait while we redirect you to your dashboard...
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SuccessCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Suspense
        fallback={
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-center">
              <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          </Card>
        }
      >
        <CallbackContent />
      </Suspense>
    </div>
  );
}
