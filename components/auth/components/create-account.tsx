"use client";

import { Eye, EyeOff } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CountrySelect } from "@/components/ui/country-select";
import { AccountTypeSelector } from "../AccountTypeSelector";
import { DeveloperFields } from "../DeveloperFields";
import { StartupFields } from "../StartupFields";
import { useCreateAccount } from "@/components/auth/hooks/useCreateAccount";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import type { CreateAccountFormData } from "@/types/auth.types";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { ConvexError } from "convex/values";


const CreateAccount = () => {
  const { form, showPassword, setShowPassword } = useCreateAccount();
  const accountType = form.watch("type");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const completeProfile = useMutation(api.users.completeUserProfile);
  const { signIn } = useAuthActions();

  // Handle form submission with Convex Auth
  const handleSubmit = async (values: CreateAccountFormData) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("name", values.name);
    formData.append("flow", "signUp");

    try {
      // Create account with Convex Auth
      await signIn("password", formData);
      
      // Wait a moment for the user to be properly created in Convex
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Complete the user profile with additional fields
      try {
        await completeProfile({
          phoneNumber: values.phoneNumber || undefined,
          countryCode: values.countryCode || undefined,
          type: values.type.toUpperCase() as any,
          developerFields: values.developerFields
            ? {
                primaryRole:
                  values.developerFields.primaryRole || undefined,
              }
            : undefined,
          startupFields: values.startupFields
            ? {
                companyName:
                  values.startupFields.companyName || undefined,
                teamSize: values.startupFields.teamSize || undefined,
              }
            : undefined,
        });

        toast.success("Account created successfully!");
        router.push("/dashboard");
      } catch (profileError) {
        toast.success("Account created successfully!", {
          description: "Please complete your profile in settings."
        });
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      const errorMessage = error instanceof ConvexError
        ? (error.data as { message: string }).message
        : error.message || "Failed to create account";
      
      toast.error("Sign Up Failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "#18181B",
            border: "1px solid #27272A",
            color: "#ffffff",
          },
        }}
      />
      <Form {...form}>
      <form
        className="w-full max-w-full sm:max-w-[600px] md:max-w-[700px]"
        onSubmit={form.handleSubmit(handleSubmit)}
      >

        {/* Fields */}
        <div className="space-y-4 md:space-y-6">
          <AccountTypeSelector form={form} />

          {/* Row 1: Name, Country Code + Phone Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      className="bg-transparent placeholder:bg-transparent border-grayBorders"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Phone Number</FormLabel>
              <div className="flex gap-2 mt-2">
                <FormField
                  control={form.control}
                  name="countryCode"
                  render={({ field }) => (
                    <FormItem className="w-1/3">
                      <FormControl>
                        <CountrySelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Country"
                          className="w-full"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Enter your phone number"
                          className="bg-transparent placeholder:bg-transparent border-grayBorders"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Email and Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      className="bg-transparent placeholder:bg-transparent border-grayBorders"
                      {...field}
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
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="bg-transparent placeholder:bg-transparent border-grayBorders"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center bg-transparent"
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
          </div>

          {/* Role-specific fields */}
          {accountType === "developer" && (
            <div className="grid grid-cols-1">
              <DeveloperFields form={form} />
            </div>
          )}
          {accountType === "startup" && (
            <div className="grid grid-cols-1">
              <StartupFields form={form} />
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-6 md:mt-8 w-full justify-center px-2 sm:px-0">
          <Button
            variant="primary"
            size="lg"
            disabled={isLoading}
            type="submit"
            className="w-full sm:w-2/3 md:w-1/2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Loading...
              </span>
            ) : (
              "Sign Up"
            )}
          </Button>
        </div>
      </form>
      </Form>
    </>
  );
};

export default CreateAccount;
