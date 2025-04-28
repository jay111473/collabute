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
import { AccountTypeSelector } from "../AccountTypeSelector";
import { DeveloperFields } from "../DeveloperFields";
import { StartupFields } from "../StartupFields";
import { useCreateAccount } from "@/components/auth/hooks/useCreateAccount";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { signupAction } from "@/lib/actions/signup-action";
import { useActionState } from "react";
import { toast } from "sonner";
import type { CreateAccountResponse } from "@/types/auth.types";

const initialState: CreateAccountResponse & { error?: string } = {
  success: false,
  message: "",
  userId: undefined,
  error: undefined,
};

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <Button variant="primary" size="lg" disabled={pending} type="submit">
      {pending ? (
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
        "Continue"
      )}
    </Button>
  );
};

const CreateAccount = () => {
  const { form, showPassword, setShowPassword } = useCreateAccount();
  const [state, formAction] = useActionState(
    signupAction as (
      state: typeof initialState,
      formData: FormData
    ) => Promise<typeof initialState>,
    initialState
  );
  const accountType = form.watch("type");

  // Show toast on error or success
  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    } else if (state.success) {
      toast.success(state.message || "Account created successfully!");
      form.reset();
    }
  }, [state, form]);

  return (
    <Form {...form}>
      <form className="w-full min-w-[600px]" action={formAction}>
        {/* Ensure 'type' is always submitted */}
        <input type="hidden" name="type" value={form.watch("type") ?? ""} />
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

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          <SubmitButton />
        </div>
      </form>
    </Form>
  );
};

export default CreateAccount;
