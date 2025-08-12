"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CountrySelect } from "@/components/ui/country-select";
import { Globe, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { WebsitePreview } from "@/components/ui/url-preview";
import {
  DribbblePreview,
  BehancePreview,
  LayersPreview,
} from "@/components/ui/design-platform-preview";
import { UseFormReturn } from "react-hook-form";
import type {
  CreateAccountFormData,
  DesignerFormData,
  DesignWorkType,
  PortfolioType,
} from "@/types/auth.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface DesignerWizardProps {
  form: UseFormReturn<CreateAccountFormData>;
  onComplete: (data: DesignerFormData) => void;
  onSubmit: () => void;
  onBasicInfoComplete?: (
    values: CreateAccountFormData
  ) => Promise<string | void>;
  initialData?: any;
  startFromStep?: number;
  setCurrentStep: (step: number) => void;
  currentStep: number;
  setShowDesignerWizard: (value: boolean) => void;
}

const DesignerWizard = ({
  form,
  onComplete,
  onSubmit,
  initialData,
  setCurrentStep,
  currentStep,
  setShowDesignerWizard,
}: DesignerWizardProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [designerData, setDesignerData] = useState<DesignerFormData>({
    basicInfo: initialData || {
      fullName: "",
      email: "",
      country: "",
      phoneNumber: "",
    },
    profiles: {
      portfolioType: "Personal Website (Preferred)",
      portfolioUrl: "",
      dribbbleProfile: "",
      behanceProfile: "",
      layersProfile: "",
    },
    experience: {
      professionalDesignExperience: "2-3 years",
      startupExperience: "0-1 years",
      designWorkTypes: [],
    },
    availability: {
      availabilityHours: "1-2 hours",
      qualityOverDelivery: "",
      favoriteProducts: "",
    },
  });
  const maxStep = 5;

  const updateNestedField = (
    section: keyof DesignerFormData,
    field: string,
    value: any
  ) => {
    const updatedData = {
      ...designerData,
      [section]: {
        ...designerData[section],
        [field]: value,
      },
    };

    setDesignerData(updatedData);

    // Also update the main form with the complete data
    form.setValue("designerFields", updatedData);

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

    const fullName = form.getValues("designerFields.basicInfo.fullName") || "";
    const email = form.getValues("designerFields.basicInfo.email") || "";
    const country = form.getValues("designerFields.basicInfo.country") || "";

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

    if (!designerData.profiles.portfolioUrl.trim()) {
      errors["profiles.portfolioUrl"] = "Portfolio URL is required";
    }
    if (!/^https?:\/\/.+/.test(designerData.profiles.portfolioUrl)) {
      errors["profiles.portfolioUrl"] = "Please enter a valid URL";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};

    if (designerData.experience.designWorkTypes.length === 0) {
      errors["experience.designWorkTypes"] =
        "Please select at least one design work type";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep4 = (): boolean => {
    const errors: Record<string, string> = {};

    if (!designerData.availability.qualityOverDelivery.trim()) {
      errors["availability.qualityOverDelivery"] =
        "Please answer this question";
    }

    if (!designerData.availability.favoriteProducts.trim()) {
      errors["availability.favoriteProducts"] = "Please answer this question";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = validateStep1();
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
            form.setValue("type", "designer");

            // For designers, basic info is already in the main form from step 1
            // Just ensure we have all the updated designer-specific data

            // Complete the designer data and save to form
            onComplete(designerData);
            await onSubmit();
            // Success - show toast and redirect will happen in the parent component
            toast.success("Application submitted successfully!", {
              description:
                "Your application is under review. We'll contact you soon!",
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
        setShowDesignerWizard(false);
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
      // case 1:
      //   return (
      //     <div className="space-y-6 max-w-2xl mx-auto">
      //       <h2 className="text-3xl font-bold text-white mb-8 text-center">
      //         Basic information
      //       </h2>

      //       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      //         <div className="space-y-2">
      //           <Label htmlFor="fullName" className="text-white font-medium">
      //             Full Name
      //           </Label>
      //           <Input
      //             id="fullName"
      //             type="text"
      //             placeholder="Enter your project name ..."
      //             className="bg-[#0f0f23] border-[#16213e] text-white placeholder:text-gray-500 focus:outline-none focus:ring-0"
      //             value={designerData.basicInfo.fullName}
      //             onChange={(e) =>
      //               updateNestedField("basicInfo", "fullName", e.target.value)
      //             }
      //           />
      //           {renderFieldError("basicInfo.fullName")}
      //         </div>

      //         <div className="space-y-2">
      //           <Label htmlFor="country" className="text-white font-medium">
      //             Country
      //           </Label>
      //           <CountrySelect
      //             value={designerData.basicInfo.country}
      //             onValueChange={(value) =>
      //               updateNestedField("basicInfo", "country", value)
      //             }
      //             placeholder="Select your location here"
      //           />
      //           {renderFieldError("basicInfo.country")}
      //         </div>
      //       </div>

      //       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      //         <div className="space-y-2">
      //           <Label htmlFor="email" className="text-white font-medium">
      //             Email Address
      //           </Label>
      //           <Input
      //             id="email"
      //             type="email"
      //             placeholder="Enter your email address here..."
      //             className="bg-[#0f0f23] border-[#16213e] text-white placeholder:text-gray-500 focus:outline-none focus:ring-0"
      //             value={designerData.basicInfo.email}
      //             onChange={(e) =>
      //               updateNestedField("basicInfo", "email", e.target.value)
      //             }
      //           />
      //           {renderFieldError("basicInfo.email")}
      //         </div>

      //         <div className="space-y-2">
      //           <Label htmlFor="phoneNumber" className="text-white font-medium">
      //             Phone Number <span className="text-gray-400">(optional)</span>
      //           </Label>
      //           <div className="flex">
      //             <div className="flex items-center bg-[#0f0f23] border border-[#16213e] border-r-0 px-3 rounded-l-md">
      //               <img
      //                 src="/api/placeholder/20/15"
      //                 alt="US"
      //                 className="w-5 h-3 mr-2"
      //               />
      //               <span className="text-white text-sm">+91</span>
      //             </div>
      //             <Input
      //               id="phoneNumber"
      //               type="tel"
      //               placeholder="XXX XXX XX"
      //               className="bg-[#0f0f23] border-[#16213e] text-white placeholder:text-gray-500 rounded-l-none focus:outline-none focus:ring-0"
      //               value={designerData.basicInfo.phoneNumber}
      //               onChange={(e) =>
      //                 updateNestedField(
      //                   "basicInfo",
      //                   "phoneNumber",
      //                   e.target.value
      //                 )
      //               }
      //             />
      //           </div>
      //         </div>
      //       </div>
      //     </div>
      //   );

      case 2:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2 text-left">
              Social Portfolios
            </h2>

            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-white font-medium">Portfolio URL</Label>

                <div className="flex flex-wrap gap-4 mb-2">
                  {(
                    [
                      "Personal Website (Preferred)",
                      "PDF Portfolio",
                      "Figma/Adobe XD Link",
                    ] as PortfolioType[]
                  ).map((type) => (
                    <label
                      key={type}
                      className={`flex items-center space-x-3 cursor-pointer px-4 py-2 rounded-md border transition-all duration-200 ${
                        designerData.profiles.portfolioType === type
                          ? "bg-darkGray2 border-grayBorders text-white"
                          : "bg-darkGray border-grayBorders text-gray-300 hover:bg-darkGray2 hover:border-grayBorders"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          designerData.profiles.portfolioType === type
                            ? "border-purple-400 bg-purple-400"
                            : "border-grayBorders bg-transparent"
                        }`}
                      >
                        {designerData.profiles.portfolioType === type && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <input
                        type="radio"
                        name="portfolioType"
                        value={type}
                        checked={designerData.profiles.portfolioType === type}
                        onChange={(e) =>
                          updateNestedField(
                            "profiles",
                            "portfolioType",
                            e.target.value as PortfolioType
                          )
                        }
                        className="sr-only"
                      />
                      <span className="text-xs font-medium">{type}</span>
                    </label>
                  ))}
                </div>

                <Input
                  type="url"
                  placeholder="Enter your portfolio website ..."
                  className="bg-darkGray border-grayBorders text-white placeholder:text-gray-500 focus:outline-none focus:ring-0"
                  value={designerData.profiles.portfolioUrl}
                  onChange={(e) =>
                    updateNestedField(
                      "profiles",
                      "portfolioUrl",
                      e.target.value
                    )
                  }
                />
                {renderFieldError("profiles.portfolioUrl")}
                <WebsitePreview url={designerData.profiles.portfolioUrl} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white font-medium flex items-center gap-2">
                    <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    Dribbble profile
                  </Label>
                  <Input
                    type="url"
                    placeholder="Enter your profile address ..."
                    className="bg-darkGray border-grayBorders text-white placeholder:text-gray-500 focus:outline-none focus:ring-0"
                    value={designerData.profiles.dribbbleProfile}
                    onChange={(e) =>
                      updateNestedField(
                        "profiles",
                        "dribbbleProfile",
                        e.target.value
                      )
                    }
                  />
                  <DribbblePreview
                    url={designerData.profiles.dribbbleProfile || ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-medium flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Be</span>
                    </div>
                    Behance profile
                  </Label>
                  <Input
                    type="url"
                    placeholder="Enter your profile address ..."
                    className="bg-darkGray border-grayBorders text-white placeholder:text-gray-500 focus:outline-none focus:ring-0"
                    value={designerData.profiles.behanceProfile}
                    onChange={(e) =>
                      updateNestedField(
                        "profiles",
                        "behanceProfile",
                        e.target.value
                      )
                    }
                  />
                  <BehancePreview
                    url={designerData.profiles.behanceProfile || ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white font-medium flex items-center gap-2">
                  <div className="w-5 h-5 bg-darkGray rounded flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded"></div>
                  </div>
                  Layers.io profile
                </Label>
                <Input
                  type="url"
                  placeholder="Enter your profile address ..."
                  className="bg-darkGray border-grayBorders text-white placeholder:text-gray-500 focus:outline-none focus:ring-0"
                  value={designerData.profiles.layersProfile}
                  onChange={(e) =>
                    updateNestedField(
                      "profiles",
                      "layersProfile",
                      e.target.value
                    )
                  }
                />
                <LayersPreview
                  url={designerData.profiles.layersProfile || ""}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2 text-left">
              Professional Experience
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white font-medium">
                  Professional Design Experience
                </Label>
                <Select
                  value={designerData.experience.professionalDesignExperience}
                  onValueChange={(value) =>
                    updateNestedField(
                      "experience",
                      "professionalDesignExperience",
                      value
                    )
                  }
                >
                  <SelectTrigger className="bg-darkGray border-grayBorders text-white focus:outline-none focus:ring-0">
                    <SelectValue />
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

              <div className="space-y-2">
                <Label className="text-white">
                  Startup/Early-stage Company Experience
                </Label>
                <Select
                  value={designerData.experience.startupExperience}
                  onValueChange={(value) =>
                    updateNestedField("experience", "startupExperience", value)
                  }
                >
                  <SelectTrigger className="bg-darkGray border-grayBorders text-white focus:outline-none focus:ring-0">
                    <SelectValue />
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
                What type of design work energizes you most?
                <span className="text-gray-400">(Select all that apply)</span>
              </Label>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {(
                  [
                    "SaaS Platform Design",
                    "E-commerce Design",
                    "Mobile App Design",
                    "Landing Page Design",
                    "Brand Identity Design",
                    "Dashboard/Data Visualization",
                    "Marketplace Design",
                  ] as DesignWorkType[]
                ).map((workType) => (
                  <label
                    key={workType}
                    className="flex items-center space-x-3 p-1 rounded-lg border border-grayBorders bg-darkGray hover:bg-darkGray2 transition-colors cursor-pointer w-full"
                  >
                    <input
                      type="checkbox"
                      checked={designerData.experience.designWorkTypes.includes(
                        workType
                      )}
                      onChange={(e) => {
                        const currentTypes =
                          designerData.experience.designWorkTypes;
                        if (e.target.checked) {
                          updateNestedField("experience", "designWorkTypes", [
                            ...currentTypes,
                            workType,
                          ]);
                        } else {
                          updateNestedField(
                            "experience",
                            "designWorkTypes",
                            currentTypes.filter((t) => t !== workType)
                          );
                        }
                      }}
                      className="w-4 h-4 text-purple-600 bg-darkGray border-grayBorders rounded focus:ring-purple-500"
                    />
                    <span className="text-white text-xs flex-1">
                      {workType}
                    </span>
                  </label>
                ))}
              </div>
              {renderFieldError("experience.designWorkTypes")}
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
                        designerData.availability.availabilityHours === hours
                          ? "border-purple-600 bg-darkGray"
                          : "border-grayBorders bg-darkGray hover:bg-darkGray2"
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
                          designerData.availability.availabilityHours === hours
                            ? "bg-purple-400 border-purple-600 text-black"
                            : "border-grayBorders bg-transparent"
                        }`}
                      >
                        {designerData.availability.availabilityHours ===
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
                  Do you value quality over delivery?{" "}
                  <span className="text-gray-400 text-sm">(150 words max)</span>
                </Label>
                <Textarea
                  placeholder="Write here..."
                  className="bg-darkGray border-grayBorders text-white placeholder:text-gray-500 min-h-[100px] resize-none focus:outline-none focus:ring-0"
                  value={designerData.availability.qualityOverDelivery}
                  onChange={(e) =>
                    updateNestedField(
                      "availability",
                      "qualityOverDelivery",
                      e.target.value
                    )
                  }
                  maxLength={150}
                />
                <div className="text-right text-xs text-gray-500">
                  {designerData.availability.qualityOverDelivery.length}/150
                </div>
                {renderFieldError("availability.qualityOverDelivery")}
              </div>
              <div className="space-y-2">
                <Label className="text-white">
                  Name your favorite products as a designer?{" "}
                </Label>
                <Textarea
                  placeholder="Write here..."
                  className="bg-darkGray border-grayBorders text-white placeholder:text-gray-500 min-h-[100px] resize-none focus:outline-none focus:ring-0"
                  value={designerData.availability.favoriteProducts}
                  onChange={(e) =>
                    updateNestedField(
                      "availability",
                      "favoriteProducts",
                      e.target.value
                    )
                  }
                />
                {renderFieldError("availability.favoriteProducts")}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <div className="relative mb-8">
              <div className="inline-block bg-darkGray text-white text-sm px-3 py-2 rounded-lg">
                Thank you, {designerData.basicInfo.fullName || "User"}!
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
                  Our team will review your application with care
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
                    href="mailto:designers@collabute.com"
                    className="text-purple-400 underline hover:text-purple-300 transition-colors"
                  >
                    designers@collabute.com
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
    <div className="p-2">
      <div className="w-full max-w-6xl">
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

export default DesignerWizard;
