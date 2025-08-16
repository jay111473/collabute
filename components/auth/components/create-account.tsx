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
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import type {
  CreateAccountFormData,
  TeamLeadFormData,
  DesignerFormData,
} from "@/types/auth.types";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { ConvexError } from "convex/values";
import TeamLeadWizard from "../TeamLeadWizard";
import DesignerWizard from "../DesignerWizard";

interface CreateAccountProps {
  invitationData?: {
    token?: string;
    type?: string;
    email?: string;
  } | null;
}

const CreateAccount = ({ invitationData }: CreateAccountProps) => {
  const { form, showPassword, setShowPassword, resetFormErrors } =
    useCreateAccount(invitationData || undefined);
  const accountType = form.watch("type");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [showTeamLeadWizard, setShowTeamLeadWizard] = useState(false);
  const [showDesignerWizard, setShowDesignerWizard] = useState(false);
  const [teamLeadStep1Data, setTeamLeadStep1Data] = useState<any>(null);
  const [designerStep1Data, setDesignerStep1Data] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const { signIn } = useAuthActions();
  const completeWizardProfile = useMutation(
    api.users.completeWizardUserProfile
  );

  // Create user account after basic info is collected using Convex Auth
  const createAccountAfterBasicInfo = async (values: CreateAccountFormData) => {
    try {
      console.log("Creating user account with basic info:", values);

      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("name", values.name);
      formData.append("flow", "signUp");
      if (values.phoneNumber)
        formData.append("phoneNumber", values.phoneNumber);
      if (values.countryCode)
        formData.append("countryCode", values.countryCode);
      formData.append("type", values.type.toUpperCase());

      await signIn("password", formData);

      console.log("User account created successfully");
    } catch (error: any) {
      console.error("Error creating user account:", error);
      toast.error("Failed to create account", {
        description: error.message || "Please try again",
      });
      throw error;
    }
  };

  useEffect(() => {
    resetFormErrors(); // reset form error when type changes

    if (accountType === "project_manager") {
      setShowTeamLeadWizard(false);
      setCurrentStep(1);
      form.setValue("teamLeadFields.basicInfo", {
        fullName: "",
        email: "",
        country: "",
        phoneNumber: "",
      });
    }

    if (accountType === "designer") {
      setShowDesignerWizard(false);
      setCurrentStep(1);
      form.setValue("designerFields.basicInfo", {
        fullName: "",
        email: "",
        country: "",
        phoneNumber: "",
      });
    }
  }, [accountType, form]); // don't add resetFormErrors() as dependency. It will cause render cycle (max- depth reached error)

  // Prevent browser warning during form submission
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Don't show warning during submission
      if (isLoading) {
        return;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isLoading]);

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

  const handleDesignerComplete = (designerData: DesignerFormData) => {
    const completeDesignerData: DesignerFormData = {
      basicInfo: designerStep1Data,
      profiles: designerData.profiles,
      experience: designerData.experience,
      availability: designerData.availability,
    };

    form.setValue("designerFields", completeDesignerData);

    form.setValue("name", designerStep1Data.fullName);
    form.setValue("email", designerStep1Data.email);
    form.setValue("phoneNumber", designerStep1Data.phoneNumber || "");
    form.setValue("countryCode", designerStep1Data.country || "");
  };

  const handleTeamLeadSubmit = async () => {
    try {
      const values = form.getValues();
      await handleSubmit(values, true); // Skip toast to prevent duplicate - wizard shows its own success message
      setCurrentStep(5);
    } catch (error) {
      console.error("Team lead submission error:", error);
    }
  };

  const handleDesignerSubmit = async () => {
    try {
      const values = form.getValues();
      await handleSubmit(values, true); // Skip toast to prevent duplicate - wizard shows its own success message
      setCurrentStep(5);
    } catch (error) {
      console.error("Designer submission error:", error);
    }
  };

  const handleDesignerStep1Next = async () => {
    const nameValid = form.trigger("designerFields.basicInfo.fullName");
    const emailValid = form.trigger("designerFields.basicInfo.email");
    const countryValid = form.trigger("designerFields.basicInfo.country");

    const [nameIsValid, emailIsValid, countryIsValid] = await Promise.all([
      nameValid,
      emailValid,
      countryValid,
    ]);

    if (nameIsValid && emailIsValid && countryIsValid) {
      setIsLoading(true);

      try {
        const name = form.getValues("designerFields.basicInfo.fullName");
        const email = form.getValues("designerFields.basicInfo.email");
        const phoneNumber = form.getValues(
          "designerFields.basicInfo.phoneNumber"
        );
        const countryCode = form.getValues("designerFields.basicInfo.country");
        const password = form.getValues("password");

        // Store step 1 data
        setDesignerStep1Data({
          fullName: name,
          email: email,
          phoneNumber: phoneNumber,
          country: countryCode,
        });

        // Account data will be created later when wizard is complete
        // Don't create account yet - wait until wizard is complete

        // Account created successfully, proceed to step 2
        setShowDesignerWizard(true);
        setCurrentStep(2);
      } catch (error) {
        console.error("Failed to create designer account:", error);
        // Error is already handled in createAccountAfterBasicInfo
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTeamLeadStep1Next = async () => {
    const nameValid = form.trigger("teamLeadFields.basicInfo.fullName");
    const emailValid = form.trigger("teamLeadFields.basicInfo.email");
    const countryValid = form.trigger("teamLeadFields.basicInfo.country");

    const [nameIsValid, emailIsValid, countryIsValid] = await Promise.all([
      nameValid,
      emailValid,
      countryValid,
    ]);

    if (nameIsValid && emailIsValid && countryIsValid) {
      setIsLoading(true);

      try {
        const name = form.getValues("teamLeadFields.basicInfo.fullName");
        const email = form.getValues("teamLeadFields.basicInfo.email");
        const phoneNumber = form.getValues(
          "teamLeadFields.basicInfo.phoneNumber"
        );
        const countryCode = form.getValues("teamLeadFields.basicInfo.country");
        const password = form.getValues("password");

        // Store step 1 data
        setTeamLeadStep1Data({
          fullName: name,
          email: email,
          country: countryCode,
          phoneNumber: phoneNumber,
        });

        // Account data will be created later when wizard is complete
        // Don't create account yet - wait until wizard is complete

        // Account created successfully, proceed to step 2
        setShowTeamLeadWizard(true);
        setCurrentStep(2);
      } catch (error) {
        console.error("Failed to create team lead account:", error);
        // Error is already handled in createAccountAfterBasicInfo
      } finally {
        setIsLoading(false);
      }
    }
  };


  // Handle form submission - show GitHub for developers/startups
  const handleSubmit = async (
    values: CreateAccountFormData,
    skipToast = false
  ) => {
    // For developers and startups, redirect to GitHub integration step
    if (values.type === "developer" || values.type === "startup") {
      // Store the account data in sessionStorage to use after GitHub step
      sessionStorage.setItem("pendingAccountData", JSON.stringify(values));
      // Redirect to GitHub step
      window.location.href = `/onboarding?step=github&type=${values.type}`;
      return;
    }

    // For other types, create account directly
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("name", values.name);
      formData.append("flow", "signUp");

      if (values.phoneNumber)
        formData.append("phoneNumber", values.phoneNumber);
      if (values.countryCode)
        formData.append("countryCode", values.countryCode);
      formData.append("type", values.type.toUpperCase());

      await signIn("password", formData);

      // Complete profile with wizard data
      try {
        await completeWizardProfile({
          teamLeadFields: values.teamLeadFields
            ? {
                profiles: values.teamLeadFields.profiles,
                experience: values.teamLeadFields.experience,
                availability: values.teamLeadFields.availability,
              }
            : undefined,
          designerFields: values.designerFields
            ? {
                profiles: values.designerFields.profiles,
                experience: values.designerFields.experience,
                availability: values.designerFields.availability,
              }
            : undefined,
        });
      } catch (profileError: any) {
        console.warn("Profile completion error (non-critical):", profileError);
      }

      if (!skipToast) {
        toast.success("Profile submitted successfully!", {
          description:
            "Your application is under review. We'll contact you soon!",
        });
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      const errorMessage =
        error instanceof ConvexError
          ? (error.data as { message: string }).message
          : error.message || "Failed to create account";
      toast.error("Account Creation Failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <Form {...form}>
        <form
          className="w-full max-w-full sm:max-w-[600px] md:max-w-[700px]"
          onSubmit={form.handleSubmit(
            (values) => handleSubmit(values),
            (errors) => {
              console.error("Form validation errors:", errors);
              // Show first error to user
              const firstError = Object.values(errors)[0] as any;
              if (firstError?.message) {
                toast.error("Validation Error", {
                  description: firstError.message
                });
              }
            }
          )}
        >
          <div className="space-y-4 md:space-y-6">
            {!(accountType === "project_manager" && showTeamLeadWizard) &&
              !(accountType === "designer" && showDesignerWizard) && (
                <AccountTypeSelector
                  form={form}
                  invitationData={invitationData}
                />
              )}

            {accountType === "project_manager" &&
              (showTeamLeadWizard ||
                currentStep === 5 ||
                currentStep === 6) && (
                <TeamLeadWizard
                  form={form}
                  onComplete={handleTeamLeadComplete}
                  onSubmit={handleTeamLeadSubmit}
                  onBasicInfoComplete={createAccountAfterBasicInfo}
                  onGitHubComplete={() => router.push("/dashboard")}
                  onGitHubSkip={() => router.push("/dashboard")}
                  initialData={teamLeadStep1Data}
                  startFromStep={2}
                  setCurrentStep={setCurrentStep}
                  currentStep={currentStep}
                  setShowTeamLeadWizard={setShowTeamLeadWizard}
                />
              )}

            {accountType === "designer" &&
              (showDesignerWizard || currentStep === 5) && (
                <DesignerWizard
                  form={form}
                  onComplete={handleDesignerComplete}
                  onSubmit={handleDesignerSubmit}
                  onBasicInfoComplete={createAccountAfterBasicInfo}
                  initialData={designerStep1Data}
                  startFromStep={2}
                  setCurrentStep={setCurrentStep}
                  currentStep={currentStep}
                  setShowDesignerWizard={setShowDesignerWizard}
                />
              )}

            {!(accountType === "project_manager" && showTeamLeadWizard) &&
              !(accountType === "designer" && showDesignerWizard) && (
                <>
                  {accountType === "project_manager" && currentStep === 1 && (
                    <>
                      {/* Row 1: Full Name and Phone Number with Country */}
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

                        <div>
                          <FormLabel>Phone Number</FormLabel>
                          <div className="flex gap-2 mt-2">
                            <FormField
                              control={form.control}
                              name="teamLeadFields.basicInfo.country"
                              render={({ field }) => (
                                <FormItem className="w-1/3">
                                  <FormControl>
                                    <CountrySelect
                                      value={field.value || ""}
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
                              name="teamLeadFields.basicInfo.phoneNumber"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input
                                      placeholder="Enter your phone number"
                                      className="bg-transparent placeholder:bg-transparent border-grayBorders"
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                      onBlur={field.onBlur}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Email Address and Password */}
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
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
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

                  {accountType === "designer" && currentStep === 1 && (
                    <>
                      {/* Row 1: Full Name and Phone Number with Country */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <FormField
                          control={form.control}
                          name="designerFields.basicInfo.fullName"
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

                        <div>
                          <FormLabel>Phone Number</FormLabel>
                          <div className="flex gap-2 mt-2">
                            <FormField
                              control={form.control}
                              name="designerFields.basicInfo.country"
                              render={({ field }) => (
                                <FormItem className="w-1/3">
                                  <FormControl>
                                    <CountrySelect
                                      value={field.value || ""}
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
                              name="designerFields.basicInfo.phoneNumber"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input
                                      placeholder="Enter your phone number"
                                      className="bg-transparent placeholder:bg-transparent border-grayBorders"
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                      onBlur={field.onBlur}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Email Address and Password */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <FormField
                          control={form.control}
                          name="designerFields.basicInfo.email"
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
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
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

                  {!(accountType === "project_manager" && currentStep === 1) &&
                    !(accountType === "designer" && currentStep === 1) && (
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
                                      onClick={() =>
                                        setShowPassword(!showPassword)
                                      }
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
          ) &&
            !(
              accountType === "designer" &&
              (showDesignerWizard || currentStep === 5)
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
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
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
                      "Next"
                    )}
                  </Button>
                ) : accountType === "designer" && currentStep === 1 ? (
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={isLoading}
                    type="button"
                    onClick={handleDesignerStep1Next}
                    className="w-full sm:w-2/3 md:w-1/2"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
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
                      "Next"
                    )}
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
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
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
