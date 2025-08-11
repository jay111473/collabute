"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CountrySelect } from "@/components/ui/country-select";
import { Globe, Github, Twitter, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  WebsitePreview,
  GitHubPreview,
  XPreview,
} from "@/components/ui/url-preview";
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";
import type {
  CreateAccountFormData,
  TeamLeadFormData,
} from "@/types/auth.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface TeamLeadWizardProps {
  form: UseFormReturn<CreateAccountFormData>;
  onComplete: (data: TeamLeadFormData) => void;
  onSubmit: () => void;
  onBasicInfoComplete?: (
    values: CreateAccountFormData
  ) => Promise<string | void>;
  initialData?: any;
  startFromStep?: number;
  setCurrentStep: (step: number) => void;
  currentStep: number;
  setShowTeamLeadWizard: (val: boolean) => void;
}

const TeamLeadWizard = ({
  form,
  onComplete,
  onSubmit,
  onBasicInfoComplete,
  initialData,
  startFromStep = 1,
  setCurrentStep,
  currentStep,
  setShowTeamLeadWizard,
}: TeamLeadWizardProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [teamLeadData, setTeamLeadData] = useState<TeamLeadFormData>({
    basicInfo: initialData || {
      fullName: "",
      email: "",
      country: "",
      phoneNumber: "",
    },
    profiles: {
      personalWebsite: "",
      github: "",
      xProfile: "",
    },
    experience: {
      professionalPMExperience: "2-3 years",
      startupExperience: "1-2 years",
      projectSpecialties: [],
    },
    availability: {
      availabilityHours: "1-2 hours",
      greatSoftwareDefinition: "",
      projectManagementDescription: "",
    },
  });
  const maxStep = 5;

  const updateNestedField = (
    section: keyof TeamLeadFormData,
    field: string,
    value: any
  ) => {
    const updatedData = {
      ...teamLeadData,
      [section]: {
        ...teamLeadData[section],
        [field]: value,
      },
    };

    setTeamLeadData(updatedData);

    // Also update the main form with the complete data
    form.setValue("teamLeadFields", updatedData);

    const errorKey = `${section}.${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors((prev) => ({
        ...prev,
        [errorKey]: "",
      }));
    }
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};

    const fullName = form.getValues("teamLeadFields.basicInfo.fullName") || "";
    const email = form.getValues("teamLeadFields.basicInfo.email") || "";
    const country = form.getValues("teamLeadFields.basicInfo.country") || "";

    if (!fullName.trim()) {
      errors["basicInfo.fullName"] = "Full name is required";
    }

    if (!email.trim()) {
      errors["basicInfo.email"] = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors["basicInfo.email"] = "Please enter a valid email address";
    }

    if (!country.trim()) {
      errors["basicInfo.country"] = "Country is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};

    if (!teamLeadData.profiles.github.trim()) {
      errors["profiles.github"] = "GitHub profile is required";
    }

    if (!teamLeadData.profiles.xProfile.trim()) {
      errors["profiles.xProfile"] = "X profile is required";
    }

    if (
      teamLeadData.profiles.personalWebsite?.trim() &&
      !/^https?:\/\/.+/.test(teamLeadData.profiles.personalWebsite)
    ) {
      errors["profiles.personalWebsite"] =
        "Please enter a valid URL (starting with http:// or https://)";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};

    if (teamLeadData.experience.projectSpecialties.length === 0) {
      errors["experience.projectSpecialties"] =
        "At least one project specialty must be selected";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep4 = (): boolean => {
    const errors: Record<string, string> = {};

    if (!teamLeadData.availability.greatSoftwareDefinition.trim()) {
      errors["availability.greatSoftwareDefinition"] = "This field is required";
    } else if (
      teamLeadData.availability.greatSoftwareDefinition.trim().length < 10
    ) {
      errors["availability.greatSoftwareDefinition"] =
        "Please provide at least 10 characters";
    }

    if (!teamLeadData.availability.projectManagementDescription.trim()) {
      errors["availability.projectManagementDescription"] =
        "This field is required";
    } else if (
      teamLeadData.availability.projectManagementDescription.trim().length < 10
    ) {
      errors["availability.projectManagementDescription"] =
        "Please provide at least 10 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        if (isValid && onBasicInfoComplete) {
          try {
            setIsSubmitting(true);
            // Update form with current data before creating account
            form.setValue("name", teamLeadData.basicInfo.fullName);
            form.setValue("email", teamLeadData.basicInfo.email);
            form.setValue(
              "phoneNumber",
              teamLeadData.basicInfo.phoneNumber || ""
            );
            form.setValue("countryCode", teamLeadData.basicInfo.country || "");
            form.setValue("type", "project_manager");

            // Create the user account
            await onBasicInfoComplete(form.getValues());
            setIsSubmitting(false);
          } catch (error: any) {
            console.error("Account creation error:", error);
            toast.error("Failed to create account", {
              description: error.message || "Please try again",
            });
            setIsSubmitting(false);
            return;
          }
        }
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        if (isValid) {
          setIsSubmitting(true);
          try {
            // Ensure form has the correct type
            form.setValue("type", "project_manager");

            // Update all the basic info fields in the main form
            form.setValue("name", teamLeadData.basicInfo.fullName);
            form.setValue("email", teamLeadData.basicInfo.email);
            form.setValue(
              "phoneNumber",
              teamLeadData.basicInfo.phoneNumber || ""
            );
            form.setValue("countryCode", teamLeadData.basicInfo.country || "");

            // Complete the team lead data and save to form
            onComplete(teamLeadData);
            await onSubmit();
            // Success - show toast and redirect will happen in the parent component
            toast.success("Application submitted successfully!", {
              description: "Your application is under review. We'll contact you soon!",
            });
          } catch (error: any) {
            console.error("Submission error:", error);
            const errorMessage =
              error.message ||
              "Failed to submit application. Please try again.";
            toast.error("Submission Failed", {
              description: errorMessage,
            });
            setIsSubmitting(false);
          }
          return;
        }
        break;
      default:
        isValid = true;
    }

    if (isValid && currentStep < maxStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setValidationErrors({});
    if (currentStep > 1) {
      if (currentStep - 1 == 1) {
        setShowTeamLeadWizard(false);
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const renderFieldError = (errorKey: string) => {
    return validationErrors[errorKey] ? (
      <p className="text-red-400 text-sm mt-1">{validationErrors[errorKey]}</p>
    ) : null;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white text-sm">Name</Label>
                <Input
                  placeholder="Enter your full name"
                  className="bg-darkGray border-grayBorders text-white placeholder:text-gray-500 h-12"
                  value={form.watch("teamLeadFields.basicInfo.fullName") || ""}
                  onChange={(e) => {
                    form.setValue(
                      "teamLeadFields.basicInfo.fullName",
                      e.target.value
                    );
                    form.setValue("name", e.target.value); // Update main form
                    updateNestedField("basicInfo", "fullName", e.target.value);
                  }}
                />
                {renderFieldError("basicInfo.fullName")}
              </div>

              <div className="space-y-2">
                <Label className="text-white text-sm">Phone Number</Label>
                <div className="flex gap-2">
                  <CountrySelect
                    value={form.watch("teamLeadFields.basicInfo.country") || ""}
                    onValueChange={(value) => {
                      form.setValue("teamLeadFields.basicInfo.country", value);
                      form.setValue("countryCode", value); // Update main form
                      updateNestedField("basicInfo", "country", value);
                    }}
                    placeholder="Country"
                    className="bg-darkGray border-grayBorders text-white w-32"
                  />
                  <Input
                    placeholder="Enter your phone number"
                    className="bg-darkGray border-grayBorders text-white placeholder:text-gray-500 h-12 flex-1"
                    value={
                      form.watch("teamLeadFields.basicInfo.phoneNumber") || ""
                    }
                    onChange={(e) => {
                      form.setValue(
                        "teamLeadFields.basicInfo.phoneNumber",
                        e.target.value
                      );
                      form.setValue("phoneNumber", e.target.value); // Update main form
                      updateNestedField(
                        "basicInfo",
                        "phoneNumber",
                        e.target.value
                      );
                    }}
                  />
                </div>
                {renderFieldError("basicInfo.country")}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white text-sm">Email</Label>
                <Input
                  placeholder="Enter your email"
                  type="email"
                  className="bg-darkGray border-grayBorders text-white placeholder:text-gray-500 h-12"
                  value={form.watch("teamLeadFields.basicInfo.email") || ""}
                  onChange={(e) => {
                    form.setValue(
                      "teamLeadFields.basicInfo.email",
                      e.target.value
                    );
                    form.setValue("email", e.target.value); // Update main form
                    updateNestedField("basicInfo", "email", e.target.value);
                  }}
                />
                {renderFieldError("basicInfo.email")}
              </div>

              <div className="space-y-2">
                <Label className="text-white text-sm">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="bg-darkGray border-grayBorders text-white placeholder:text-gray-500 h-12 pr-10"
                    value={form.watch("password") || ""}
                    onChange={(e) => {
                      form.setValue("password", e.target.value);
                    }}
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
              </div>
            </div>

            <div className="text-center space-y-2 mt-8">
              <p className="text-gray-400">
                You&apos;ve selected Team Lead account type.
              </p>
              <p className="text-gray-400">
                Click &quot;Next&quot; to start the onboarding process.
              </p>
            </div>
          </>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2 text-left">
                Profiles
              </h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Personal website
                  </Label>
                  <Input
                    placeholder="Enter your personal website link here..."
                    className="bg-darkGray border-grayBorders text-white placeholder:text-gray-500 h-12"
                    value={teamLeadData.profiles.personalWebsite}
                    onChange={(e) =>
                      updateNestedField(
                        "profiles",
                        "personalWebsite",
                        e.target.value
                      )
                    }
                  />
                  {renderFieldError("profiles.personalWebsite")}
                  <WebsitePreview
                    url={teamLeadData.profiles.personalWebsite || ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    Github
                  </Label>
                  <Input
                    placeholder="Enter your Github profile link name..."
                    className="bg-darkGray border-grayBorders text-white placeholder:text-gray-500 h-12"
                    value={teamLeadData.profiles.github}
                    onChange={(e) =>
                      updateNestedField("profiles", "github", e.target.value)
                    }
                  />
                  {renderFieldError("profiles.github")}
                  <GitHubPreview username={teamLeadData.profiles.github} />
                </div>

                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Twitter className="w-4 h-4" />X profile
                  </Label>
                  <Input
                    placeholder="Enter your X account name here..."
                    className="bg-darkGray border-grayBorders text-white placeholder:text-gray-500 h-12"
                    value={teamLeadData.profiles.xProfile}
                    onChange={(e) =>
                      updateNestedField("profiles", "xProfile", e.target.value)
                    }
                  />
                  {renderFieldError("profiles.xProfile")}
                  <XPreview username={teamLeadData.profiles.xProfile} />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2 text-left">
                Professional Experience
              </h2>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white">
                    Project Management Experience
                  </Label>

                  <Select
                    value={teamLeadData.experience.professionalPMExperience}
                    onValueChange={(value) =>
                      updateNestedField(
                        "experience",
                        "professionalPMExperience",
                        value
                      )
                    }
                  >
                    <SelectTrigger className="bg-darkGray border-grayBorders text-white w-full focus:outline-none focus:ring-0">
                      <SelectValue placeholder="Select your experience" />
                    </SelectTrigger>
                    <SelectContent
                      className="bg-darkGray border-grayBorders text-white max-h-[200px] overflow-y-auto"
                      position="popper"
                      sideOffset={5}
                    >
                      <SelectItem value="0-1 years">0-1 years</SelectItem>
                      <SelectItem value="2-3 years">2-3 years</SelectItem>
                      <SelectItem value="4-5 years">4-5 years</SelectItem>
                      <SelectItem value="6-7 years">6-7 years</SelectItem>
                      <SelectItem value="8-10 years">8-10 years</SelectItem>
                      <SelectItem value="+10 years">+10 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">
                    Startup/Early-stage Company Experience
                  </Label>

                  <Select
                    value={teamLeadData.experience.startupExperience}
                    onValueChange={(value) =>
                      updateNestedField(
                        "experience",
                        "startupExperience",
                        value
                      )
                    }
                  >
                    <SelectTrigger className="bg-darkGray border-grayBorders text-white w-full focus:outline-none focus:ring-0">
                      <SelectValue placeholder="Select your experience" />
                    </SelectTrigger>
                    <SelectContent
                      className="bg-darkGray border-grayBorders text-white max-h-[200px] overflow-y-auto"
                      position="popper"
                      sideOffset={5}
                    >
                      <SelectItem value="0-1 years">0-1 years</SelectItem>
                      <SelectItem value="1-2 years">1-2 years</SelectItem>
                      <SelectItem value="2-3 years">2-3 years</SelectItem>
                      <SelectItem value="4-5 years">4-5 years</SelectItem>
                      <SelectItem value="6-7 years">6-7 years</SelectItem>
                      <SelectItem value="8-10 years">8-10 years</SelectItem>
                      <SelectItem value="+10 years">+10 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">
                  What type of projects do you prefer to manage?{" "}
                  <span className="text-red-400">*</span>{" "}
                  <span className="text-gray-400 text-sm">
                    (Select all that apply)
                  </span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    "SaaS Platform Management",
                    "E-commerce Projects",
                    "Mobile App Development",
                    "Web Application Projects",
                    "Enterprise Software",
                    "Dashboard/Analytics Projects",
                    "Marketplace Platforms",
                  ].map((specialty) => (
                    <div
                      key={specialty}
                      className="flex items-center space-x-3 p-2 rounded-lg  hover:bg-darkGray2 transition-colors cursor-pointer w-full"
                      onClick={() => {
                        const current =
                          teamLeadData.experience.projectSpecialties;
                        const isChecked = current.includes(specialty as any);
                        if (isChecked) {
                          updateNestedField(
                            "experience",
                            "projectSpecialties",
                            current.filter((s) => s !== specialty)
                          );
                        } else {
                          updateNestedField(
                            "experience",
                            "projectSpecialties",
                            [...current, specialty]
                          );
                        }
                      }}
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          teamLeadData.experience.projectSpecialties.includes(
                            specialty as any
                          )
                            ? "bg-purple-600 border-purple-600"
                            : "border-grayBorders bg-transparent"
                        }`}
                      >
                        {teamLeadData.experience.projectSpecialties.includes(
                          specialty as any
                        ) && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <Label className="text-white text-xs cursor-pointer flex-1">
                        {specialty}
                      </Label>
                    </div>
                  ))}
                </div>
                {renderFieldError("experience.projectSpecialties")}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2 text-left">
                Availability & Working Style
              </h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-white">
                  How many hours per day can you dedicate to Collabute projects?
                </Label>
                <div className="flex flex-wrap gap-3">
                  {[
                    "1-2 hours",
                    "3-4 hours",
                    "5-6 hours",
                    "7-8 hours",
                    "Full-time availability (8+ hours)",
                  ].map((hours) => (
                    <div
                      key={hours}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                        teamLeadData.availability.availabilityHours === hours
                          ? "border-purple-600 bg-darkGray"
                          : "border-grayBorders bg-black hover:bg-darkGray2"
                      }`}
                      onClick={() => {
                        updateNestedField(
                          "availability",
                          "availabilityHours",
                          hours
                        );
                      }}
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          teamLeadData.availability.availabilityHours === hours
                            ? "bg-purple-400 border-purple-600 text-black"
                            : "border-grayBorders bg-transparent"
                        }`}
                      >
                        {teamLeadData.availability.availabilityHours ===
                          hours && (
                          <svg
                            className="w-3 h-3 text-black"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <Label className="text-white text-sm cursor-pointer">
                        {hours}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white">
                  how you define a great software/application?{" "}
                  <span className="text-gray-400 text-sm">(150 words max)</span>
                </Label>
                <Textarea
                  placeholder="Write here..."
                  className="bg-black border-grayBorders text-white placeholder:text-gray-500 min-h-[100px] resize-none focus:outline-none focus:ring-0 dark:bg-black"
                  value={teamLeadData.availability.greatSoftwareDefinition}
                  onChange={(e) =>
                    updateNestedField(
                      "availability",
                      "greatSoftwareDefinition",
                      e.target.value
                    )
                  }
                  maxLength={150}
                />
                <div className="text-right text-xs text-gray-500">
                  {teamLeadData.availability.greatSoftwareDefinition.length}/150
                </div>
                {renderFieldError("availability.greatSoftwareDefinition")}
              </div>
              <div className="space-y-2">
                <Label className="text-white">
                  Do you manage projects or people?{" "}
                  <span className="text-gray-400 text-sm">(150 words max)</span>
                </Label>
                <Textarea
                  placeholder="Write here..."
                  className="bg-black border-grayBorders text-white placeholder:text-gray-500 min-h-[100px] resize-none focus:outline-none focus:ring-0 dark:bg-black"
                  value={teamLeadData.availability.projectManagementDescription}
                  onChange={(e) =>
                    updateNestedField(
                      "availability",
                      "projectManagementDescription",
                      e.target.value
                    )
                  }
                  maxLength={150}
                />
                <div className="text-right text-xs text-gray-500">
                  {
                    teamLeadData.availability.projectManagementDescription
                      .length
                  }
                  /150
                </div>
                {renderFieldError("availability.projectManagementDescription")}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <div className="relative mb-8">
              <div className="inline-block bg-darkGray text-white text-sm px-3 py-2 rounded-lg">
                Thank you, {teamLeadData.basicInfo.fullName || "User"}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-8">
              Application successfully submitted for review!
            </h2>

            <div className="bg-darkGray border border-grayBorders rounded-2xl p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="text-white font-semibold text-lg">
                  Expected Review Timeline{" "}
                  <span className="text-purple-400 font-bold">
                    2-3 business days
                  </span>
                </h3>
                <p className="text-gray-400 text-sm">
                  Our team will review your application with care.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-white font-semibold text-lg">Next Steps</h3>
                <p className="text-gray-400 text-sm">
                  If selected, you&apos;ll receive an invitation for a brief
                  video interview
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-white font-semibold text-lg">Questions?</h3>
                <p className="text-gray-400 text-sm">
                  Contact our designer relations team at{" "}
                  <a
                    href="mailto:TPM@collabute.com"
                    className="text-purple-400 underline hover:text-purple-300 transition-colors"
                  >
                    TPM@collabute.com
                  </a>
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Button
                variant="primary"
                size="lg"
                type="button"
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                Return to Homepage
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center p-2">
      <div className="w-full">
        <div className="w-full">{renderStepContent()}</div>

        {currentStep < 5 && (
          <div className="flex justify-end items-center mt-12 max-w-4xl mx-auto gap-x-4">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                size="lg"
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="text-white border-grayBorders disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </Button>
            ) : (
              <div></div>
            )}

            <Button
              variant="primary"
              size="lg"
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : currentStep === 4 ? (
                "Submit"
              ) : (
                "Next"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamLeadWizard;
