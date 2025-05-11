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
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { signupAction } from "@/lib/actions/signup-action";
import { useActionState } from "react";
import { toast } from "sonner";
import type {
  AccountType,
  CreateAccountFormData,
  CreateAccountResponse,
  DeveloperRole,
  TeamSize,
} from "@/types/auth.types";
import { useRouter } from "next/navigation";
import { createAccountSchema } from "@/app/auth/schemas/createAccount.schema";
import { z } from "zod";

// Initial state for server action
const initialState: CreateAccountResponse & { error?: string } = {
  success: false,
  message: "",
  userId: undefined,
  error: undefined,
};

// Define the form error type
type FormErrors = {
  [key: string]: string | undefined;
};

// Submit button with loading state
const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <Button
      variant="primary"
      size="lg"
      disabled={pending}
      type="submit"
      className="w-full sm:w-2/3 md:w-1/2"
    >
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
        "Sign Up"
      )}
    </Button>
  );
};

const CreateAccount = () => {
  const { form, showPassword, setShowPassword } = useCreateAccount();
  const [state, formAction] = useActionState(signupAction, initialState);
  const accountType = form.watch("type");
  const router = useRouter();
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Client-side validation function
  const validateForm = (formData: FormData): boolean => {
    // Create correctly typed form values object
    const formValues: Partial<CreateAccountFormData> = {
      name: formData.get("name") as string,
      type: (formData.get("type") as AccountType) || "developer",
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      phoneNumber: (formData.get("phoneNumber") as string) || null,
    };

    // Add nested fields based on account type
    if (formValues.type === "developer") {
      // Check both formats of field names - with and without dots
      const primaryRole = formData.get("developerFields.primaryRole") || formData.get("primaryRole");
      formValues.developerFields = {
        primaryRole: primaryRole as DeveloperRole || null,
      };
    } else if (formValues.type === "startup") {
      // Check both formats of field names
      const companyName = formData.get("startupFields.companyName") || formData.get("companyName");
      const teamSize = formData.get("startupFields.teamSize") || formData.get("teamSize");
      
      formValues.startupFields = {
        companyName: companyName as string,
        teamSize: teamSize as TeamSize,
      };
    }

    try {
      createAccountSchema.parse(formValues);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: FormErrors = {};
        error.errors.forEach((err) => {
          // Convert path array to dot notation for error keys
          const errorKey = err.path.join(".");
          errors[errorKey] = err.message;
        });
        setFormErrors(errors);

        // Display toast for first error
        const firstError = error.errors[0];
        if (firstError) {
          toast.error(firstError.message);
        }
      } else {
        setFormErrors({ form: "An unexpected error occurred" });
        toast.error("An unexpected error occurred");
      }
      return false;
    }
  };

  // Show toast on error or success
  useEffect(() => {
    // Log all state for debugging
    console.log("Signup response state:", state);

    if ("error" in state && state.error) {
      toast.error(state.error);
      setFormErrors({ form: state.error });
    } else if ("success" in state && state.success) {
      // Redirect to dashboard after successful signup
      router.push("/dashboard");
    }
  }, [state, form, router]);

  // Sync primary role to hidden input
  const primaryRole = form.watch("developerFields.primaryRole");
  const teamSize = form.watch("startupFields.teamSize");

  return (
    <Form {...form}>
      <form
        className="w-full max-w-full sm:max-w-[600px] md:max-w-[700px]"
        action={async (formData: FormData) => {
          // Ensure type is set before validation
          if (!formData.get("type")) {
            formData.set("type", "developer");
          }
          if (validateForm(formData)) {
          formAction(formData);
          }
        }}
      >
        {/* Only show form-level errors, not success messages */}
        {formErrors.form &&
          formErrors.form !== "User successfully created." && (
            <div className="text-red-500 text-sm mb-4">{formErrors.form}</div>
          )}

        {/* Ensure type has a default value */}
        <input
          type="hidden"
          name="type"
          value={form.watch("type") || "developer"}
        />
        
        {/* Add direct field for primary role if developer */}
        {accountType === "developer" && primaryRole && (
          <input
            type="hidden"
            name="primaryRole"
            value={primaryRole}
          />
        )}
        
        {/* Add direct field for team size if startup */}
        {accountType === "startup" && teamSize && (
          <input
            type="hidden"
            name="teamSize"
            value={teamSize}
          />
        )}
        
        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                    className={`bg-transparent placeholder:bg-transparent ${
                      formErrors.name ? "border-red-500" : "border-grayBorders"
                    }`}
                    {...field}
                  />
                </FormControl>
                {formErrors.name ? (
                  <div className="text-red-500 text-xs mt-1">
                    {formErrors.name}
                  </div>
                ) : (
                <FormMessage />
                )}
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
                    className={`bg-transparent placeholder:bg-transparent ${
                      formErrors.email ? "border-red-500" : "border-grayBorders"
                    }`}
                    {...field}
                  />
                </FormControl>
                {formErrors.email ? (
                  <div className="text-red-500 text-xs mt-1">
                    {formErrors.email}
                  </div>
                ) : (
                <FormMessage />
                )}
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
                      className={`bg-transparent placeholder:bg-transparent ${
                        formErrors.password
                          ? "border-red-500"
                          : "border-grayBorders"
                      }`}
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
                {formErrors.password ? (
                  <div className="text-red-500 text-xs mt-1">
                    {formErrors.password}
                  </div>
                ) : (
                <FormMessage />
                )}
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
                    className="bg-transparent placeholder:bg-transparent border-grayBorders"
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
        <div className="flex gap-4 mt-6 md:mt-8 w-full justify-center px-2 sm:px-0">
          <SubmitButton />
        </div>
      </form>
    </Form>
  );
};

export default CreateAccount;
