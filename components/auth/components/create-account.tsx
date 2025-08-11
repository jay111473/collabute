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
  const [showTeamLeadWizard, setShowTeamLeadWizard] = useState(false);
  const [showDesignerWizard, setShowDesignerWizard] = useState(false);
  const [teamLeadStep1Data, setTeamLeadStep1Data] = useState<any>(null);
  const [designerStep1Data, setDesignerStep1Data] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const createUserAccount = useMutation(api.users.createUserAccount);
  const completeWizardProfile = useMutation(
    api.users.completeWizardUserProfile
  );

  // Store the created user ID for profile completion
  const [createdUserId, setCreatedUserId] = useState<string | undefined>(
    undefined
  );

  // Create user account after basic info is collected
  const createAccountAfterBasicInfo = async (values: CreateAccountFormData) => {
    try {
      console.log("Creating user account with basic info:", values);

      const result = await createUserAccount({
        email: values.email,
        password: values.password,
        name: values.name,
        phoneNumber: values.phoneNumber || undefined,
        countryCode: values.countryCode || undefined,
        type: values.type.toUpperCase() as any,
      });

      if (result.success) {
        setCreatedUserId(result.userId);
        console.log("User account created with ID:", result.userId);
        return result.userId;
      }
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

        // Create account with basic info
        const accountData: CreateAccountFormData = {
          name,
          email,
          password,
          phoneNumber: phoneNumber || "",
          countryCode: countryCode || "",
          type: "designer",
          designerFields: undefined,
          teamLeadFields: undefined,
          developerFields: undefined,
          startupFields: undefined,
        };

        const userId = await createAccountAfterBasicInfo(accountData);

        if (userId) {
          // Account created successfully, proceed to step 2
          setShowDesignerWizard(true);
          setCurrentStep(2);
        }
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

        // Create account with basic info
        const accountData: CreateAccountFormData = {
          name,
          email,
          password,
          phoneNumber: phoneNumber || "",
          countryCode: countryCode || "",
          type: "project_manager",
          designerFields: undefined,
          teamLeadFields: undefined,
          developerFields: undefined,
          startupFields: undefined,
        };

        const userId = await createAccountAfterBasicInfo(accountData);

        if (userId) {
          // Account created successfully, proceed to step 2
          setShowTeamLeadWizard(true);
          setCurrentStep(2);
        }
      } catch (error) {
        console.error("Failed to create team lead account:", error);
        // Error is already handled in createAccountAfterBasicInfo
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle final form submission (complete profile)
  const handleSubmit = async (
    values: CreateAccountFormData,
    skipToast = false
  ) => {
    setIsLoading(true);

    // Debug log the values

    try {
      // If we don't have a user ID yet, create the account first
      let userId = createdUserId;
      if (!userId) {
        userId = await createAccountAfterBasicInfo(values);
      }

      if (!userId) {
        throw new Error("Failed to get user ID");
      }

      // Complete the user profile with wizard data
      console.log("Completing user profile for userId:", userId);

      // Extract only the needed fields for profile completion (excluding basicInfo)
      const teamLeadFieldsForCompletion = values.teamLeadFields ? {
        profiles: values.teamLeadFields.profiles,
        experience: values.teamLeadFields.experience,
        availability: values.teamLeadFields.availability,
      } : undefined;

      const designerFieldsForCompletion = values.designerFields ? {
        profiles: values.designerFields.profiles,
        experience: values.designerFields.experience,
        availability: values.designerFields.availability,
      } : undefined;

      await completeWizardProfile({
        userId: userId as any,
        teamLeadFields: teamLeadFieldsForCompletion,
        designerFields: designerFieldsForCompletion,
      });

      // Different handling based on user type
      if (!skipToast) {
        if (values.type === "startup") {
          toast.success("Welcome! Account created successfully!");
          window.location.href = "/dashboard";
        } else {
          toast.success("Profile submitted successfully!", {
            description:
              "Your application is under review. We'll contact you soon!",
          });
        }
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        data: error.data,
        type: typeof error,
        constructor: error.constructor.name,
      });

      const errorMessage =
        error instanceof ConvexError
          ? (error.data as { message: string }).message
          : error.message || "Failed to create account";
      console.log("errorMessage", errorMessage);

      // Show error toast to user
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
          onSubmit={(e) => {
            e.preventDefault();
            // Form submission is handled by the wizards
          }}
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
              (showTeamLeadWizard || currentStep === 5) && (
                <TeamLeadWizard
                  form={form}
                  onComplete={handleTeamLeadComplete}
                  onSubmit={handleTeamLeadSubmit}
                  onBasicInfoComplete={createAccountAfterBasicInfo}
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
