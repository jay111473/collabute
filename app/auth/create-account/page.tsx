"use client";

import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AccountTypeSelector } from "../../../components/auth/AccountTypeSelector";
import { DeveloperFields } from "../../../components/auth/DeveloperFields";
import { StartupFields } from "../../../components/auth/StartupFields";
import { useCreateAccount } from "@/components/auth/hooks/useCreateAccount";
import { useRouter } from "next/navigation";
import type { CreateAccountFormData } from "@/types/auth.types";
import { useUser } from "@/app/providers/UserContext";

const CreateAccount = () => {
  const { form, isLoading, showPassword, setShowPassword, onSubmit } = useCreateAccount();
  const accountType = form.watch("type");
  const router = useRouter();
  const { setUserId } = useUser();

  const onSubmitHandler = async (data: CreateAccountFormData) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create account");
      }

      // Store the user ID
      setUserId(result.userId);
      
      // Navigate to challenge
      const role = data.developerFields?.primaryRole || "Frontend Developer"; // Fallback
      router.push(`/auth/create-account/challenge?role=${role}`);
    } catch (error) {
      console.error("Signup error:", error);
      // Use toast for error handling
      toast.error(error instanceof Error ? error.message : "Failed to create account");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Toaster />
      <div className="flex flex-col items-center justify-center gap-y-8 px-8 w-full max-w-2xl py-12 border border-slate-200 rounded-md text-left">
        <div className="flex flex-col items-center justify-center gap-y-2">
          <Image src="/logo.svg" alt="logo" width={66} height={66} />
          <h1 className="text-3xl font-bold">Collabute</h1>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitHandler)} className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AccountTypeSelector form={form} />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
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
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
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

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your phone number"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {accountType === "developer" && <DeveloperFields form={form} />}
              {accountType === "startup" && <StartupFields form={form} />}
            </div>

            <Button
              type="submit"
              onClick={() => {
                form.handleSubmit(onSubmitHandler)();
              }}
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateAccount;
