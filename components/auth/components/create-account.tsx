"use client";

import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AccountTypeSelector } from "../AccountTypeSelector";
import { DeveloperFields } from "../DeveloperFields";
import { StartupFields } from "../StartupFields";
import { useCreateAccount } from "@/components/auth/hooks/useCreateAccount";
import { useRouter } from "next/navigation";
import type { CreateAccountFormData } from "@/types/auth.types";
import { useUser } from "@/app/providers/UserContext";
import React from "react";

interface CreateAccountProps {
  formRef?: React.RefObject<HTMLFormElement>;
  onSuccessfulSubmit?: () => void;
}

const CreateAccount = ({ formRef, onSuccessfulSubmit }: CreateAccountProps = {}) => {
  const { form, showPassword, setShowPassword } = useCreateAccount();
  const accountType = form.watch("type");
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

      // If we're in the onboarding flow and have a callback
      if (onSuccessfulSubmit) {
        onSuccessfulSubmit();
        return;
      }
    } catch (error) {
      console.error("Signup error:", error);
      // Use toast for error handling
      toast.error(
        error instanceof Error ? error.message : "Failed to create account"
      );
      
      if (onSuccessfulSubmit) {
        if (formRef?.current) {
          const errorEvent = new CustomEvent('form:error', { bubbles: true });
          formRef.current.dispatchEvent(errorEvent);
        }
      }
    }
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmitHandler)}
        className="w-full min-w-[600px]"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AccountTypeSelector form={form} />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your full name"
                    className="bg-transparent placeholder:bg-transparent border-grayBorders "
                    {...field}
                  />
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
                  <Input
                    placeholder="Enter your email"
                    className="bg-transparent placeholder:bg-transparent border-grayBorders "
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
                      className="bg-transparent placeholder:bg-transparent border-grayBorders "
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

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your phone number"
                    className="bg-transparent placeholder:bg-transparent  border-grayBorders"
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
      </form>
    </Form>
  );
};

export default CreateAccount;
