"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { login, loginformSchema } from "@/lib/login";

const Password = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { email } = useEmail();
  const router = useRouter();

  const form = useForm<z.infer<typeof loginformSchema>>({
    resolver: zodResolver(loginformSchema),
    defaultValues: {
      email: email,
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof loginformSchema>) {
    toast.promise(login(values, router), {
      loading: "Logging in...",
      success: "Successfully logged in!",
      error: "Failed to log in. Please try again.",
    });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-black">
      <Toaster />
      <div className="flex flex-col items-center justify-center gap-y-16 px-[80px] w-[500px] py-[90px] text-center rounded-md">
        <div className="flex flex-col items-center justify-center gap-y-2">
          <Image src="/logo.svg" alt="logo" width={66} height={66} />
          <h1 className="text-3xl font-bold text-white">Collabute</h1>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 w-full text-white"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start justify-center">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
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
};

export default Password;
