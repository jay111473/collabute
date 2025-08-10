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
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import type {
  CreateAccountFormData,
  TeamLeadFormData,
} from "@/types/auth.types";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { ConvexError } from "convex/values";
import TeamLeadWizard from "../TeamLeadWizard";

interface CreateAccountProps {
  invitationData?: {
    token?: string;
    type?: string;
    email?: string;
  } | null;
}

const CreateAccount = ({ invitationData }: CreateAccountProps) => {
  const { form, showPassword, setShowPassword } = useCreateAccount(
    invitationData || undefined
  );
  const accountType = form.watch("type");
  const [isLoading, setIsLoading] = useState(false);
  const [showTeamLeadWizard, setShowTeamLeadWizard] = useState(false);
  const [teamLeadStep1Data, setTeamLeadStep1Data] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const completeProfile = useMutation(api.users.completeUserProfile);
  const { signIn } = useAuthActions();

  useEffect(() => {
    if (accountType !== "project_manager") {
      setShowTeamLeadWizard(false);
      setTeamLeadStep1Data(null);
      setCurrentStep(1);
      form.reset();
      form.setValue("teamLeadFields", undefined);
    }
  }, [accountType, form]);

  const handleTeamLeadComplete = (teamLeadData: TeamLeadFormData) => {
    const completeTeamLeadData: TeamLeadFormData = {
      basicInfo: teamLeadStep1Data,
      profiles: teamLeadData.profiles,
      experience: teamLeadData.experience,
      availability: teamLeadData.availability,
    };

    form.setValue("teamLeadFields", completeTeamLeadData);

    form.setValue("name", teamLeadStep1Data.fullName);
    form.setValue("email", teamLeadStep1Data.email);
    form.setValue("phoneNumber", teamLeadStep1Data.phoneNumber || "");
    form.setValue("countryCode", teamLeadStep1Data.country || "");
  };

  const handleTeamLeadSubmit = async () => {
    try {
      const values = form.getValues();
      await handleSubmit(values);
      setCurrentStep(5);
    } catch (error) {
      console.error("Team lead submission error:", error);
    }
  };

  const handleTeamLeadStep1Next = () => {
    const nameValid = form.trigger("teamLeadFields.basicInfo.fullName");
    const emailValid = form.trigger("teamLeadFields.basicInfo.email");
    const countryValid = form.trigger("teamLeadFields.basicInfo.country");

    Promise.all([nameValid, emailValid, countryValid]).then(
      ([nameIsValid, emailIsValid, countryIsValid]) => {
        if (nameIsValid && emailIsValid && countryIsValid) {
          const name = form.getValues("teamLeadFields.basicInfo.fullName");
          const email = form.getValues("teamLeadFields.basicInfo.email");
          const phoneNumber = form.getValues(
            "teamLeadFields.basicInfo.phoneNumber"
          );
          const countryCode = form.getValues(
            "teamLeadFields.basicInfo.country"
          );

          setTeamLeadStep1Data({
            fullName: name,
            email: email,
            country: countryCode,
            phoneNumber: phoneNumber,
          });

          setShowTeamLeadWizard(true);
          setCurrentStep(2);
        }
      }
    );
  };

  // Handle form submission with Convex Auth
  const handleSubmit = async (values: CreateAccountFormData) => {
    console.log("values", values);
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
                primaryRole: values.developerFields.primaryRole || undefined,
              }
            : undefined,
          startupFields: values.startupFields
            ? {
                companyName: values.startupFields.companyName || undefined,
                teamSize: values.startupFields.teamSize || undefined,
              }
            : undefined,
          teamLeadFields: values.teamLeadFields || undefined,
        });

        if (values.type !== "project_manager") {
          window.location.href = "/dashboard";
        }
      } catch (profileError) {
        toast.success("Account created successfully!", {
          description: "Please complete your profile in settings.",
        });

        if (values.type !== "project_manager") {
          window.location.href = "/dashboard";
        }
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      const errorMessage =
        error instanceof ConvexError
          ? (error.data as { message: string }).message
          : error.message || "Failed to create account";
      console.log("errorMessage", errorMessage);
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
          onSubmit={form.handleSubmit(handleSubmit as any)}
        >
          <div className="space-y-4 md:space-y-6">
            <AccountTypeSelector form={form} invitationData={invitationData} />

            {accountType === "project_manager" ? (
              showTeamLeadWizard ? (
                <TeamLeadWizard
                  form={form}
                  onComplete={handleTeamLeadComplete}
                  onSubmit={handleTeamLeadSubmit}
                  initialData={teamLeadStep1Data}
                  startFromStep={2}
                  setCurrentStep={setCurrentStep}
                  currentStep={currentStep}
                />
              ) : (
                <>
                  {/* Row 1: Full Name and Country */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <FormField
                      control={form.control}
                      name="teamLeadFields.basicInfo.fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name..."
                              className="bg-transparent placeholder:bg-transparent border-grayBorders"
                              value={field.value || ""}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="teamLeadFields.basicInfo.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <CountrySelect
                              value={field.value || ""}
                              onValueChange={field.onChange}
                              placeholder="Select your location here"
                              className="w-full"
                              isProjectManager={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 2: Email Address and Phone Number */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <FormField
                      control={form.control}
                      name="teamLeadFields.basicInfo.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="flex items-center gap-2">
                              Email Address
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your email address here..."
                              className="bg-transparent placeholder:bg-transparent border-grayBorders"
                              value={field.value || ""}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="teamLeadFields.basicInfo.phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Phone Number{" "}
                            <span className="text-gray-400">(optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="XXX XXX XX"
                              className="bg-transparent placeholder:bg-transparent border-grayBorders"
                              value={field.value || ""}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )
            ) : (
              <>
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
              </>
            )}

            {accountType === "developer" && (
              <div className="grid grid-cols-1">
                <DeveloperFields form={form} isProjectManager={false} />
              </div>
            )}
            {accountType === "startup" && (
              <div className="grid grid-cols-1">
                <StartupFields form={form} />
              </div>
            )}
          </div>

          {!(
            accountType === "project_manager" &&
            (showTeamLeadWizard || currentStep === 5)
          ) && (
            <div className="flex gap-4 mt-6 md:mt-8 w-full justify-center px-2 sm:px-0">
              {accountType === "project_manager" && currentStep === 1 ? (
                <Button
                  variant="primary"
                  size="lg"
                  disabled={isLoading}
                  type="button"
                  onClick={handleTeamLeadStep1Next}
                  className="w-full sm:w-2/3 md:w-1/2"
                >
                  Next
                </Button>
              ) : (
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
              )}
            </div>
          )}
        </form>
      </Form>
    </>
  );
};

export default CreateAccount;
