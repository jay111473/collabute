"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { useEmail } from "@/app/providers/EmailContext";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { z } from "zod";
import { useAuthActions } from "@convex-dev/auth/react";

const loginformSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

function AuthenticatedRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-white">Redirecting to dashboard...</div>
    </div>
  );
}

function PasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { email, setEmail } = useEmail();
  const { signIn } = useAuthActions();
  const router = useRouter();

  // Redirect to main auth page if no email is set
  useEffect(() => {
    if (!email) {
      router.push("/auth");
    }
  }, [email, router]);

  const form = useForm<z.infer<typeof loginformSchema>>({
    resolver: zodResolver(loginformSchema),
    defaultValues: {
      email: email,
      password: "",
    },
  });

  // Don't render if no email
  if (!email) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-black">
      <Toaster />
      <div className="flex flex-col items-center justify-center gap-y-16 px-[80px] w-[500px] py-[90px] text-center rounded-md">
        <div className="flex flex-col items-center justify-center gap-y-2 relative">
          <button
            onClick={() => router.push("/auth")}
            className="absolute -left-12 top-0 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Image src="/logo.png" alt="logo" width={66} height={66} />
          <h1 className="text-3xl font-bold text-white">Collabute</h1>
        </div>
        <Form {...form}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              void signIn("password", formData);
            }}
            className="space-y-3 w-full text-white"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start justify-center">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      {...field}
                      disabled
                      className="bg-gray-800 text-gray-300 cursor-not-allowed"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start justify-center">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={form.formState.isSubmitting || !form.formState.isValid}
              variant="primary"
              type="submit"
              className="w-full"
            >
              Log In
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

const Password = () => {
  return (
    <>
      <AuthLoading>
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="text-white">Loading...</div>
        </div>
      </AuthLoading>

      <Authenticated>
        <AuthenticatedRedirect />
      </Authenticated>

      <Unauthenticated>
        <PasswordForm />
      </Unauthenticated>
    </>
  );
};

export default Password;
