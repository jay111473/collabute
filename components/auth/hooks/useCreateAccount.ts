import { useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { useEmail } from "@/app/providers/EmailContext";
import type {
  CreateAccountFormData,
  TeamLeadFormData,
  DesignerFormData,
} from "@/types/auth.types";
import { createAccountSchema } from "@/app/(auth)/login/schemas/createAccount.schema";

interface ApiErrorResponse {
  data?: {
    errors?: Array<{ message: string }>;
  };
  message?: string;
}

const handleApiError = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    toast.error("An unexpected error occurred. Please try again.");
    return;
  }

  const errorData = error.response?.data as ApiErrorResponse;
  const errorMessage =
    errorData?.data?.errors?.[0]?.message ||
    errorData?.message ||
    "Failed to create account";

  toast.error(errorMessage);
};

interface UseCreateAccountProps {
  token?: string;
  type?: string;
  email?: string;
}

export const useCreateAccount = (invitationData?: UseCreateAccountProps): {
  form: UseFormReturn<CreateAccountFormData>;
  isLoading: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isFormValid: () => boolean;
  hasFieldError: (fieldName: string) => boolean;
  getFieldError: (fieldName: string) => string | undefined;
  resetFormErrors: () => void;
  resetFieldError: (fieldName: string) => void;
  setIsLoading: (loading: boolean) => void;
} => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { email, setEmail } = useEmail();

  // Determine default type based on invitation
  const defaultType =
    invitationData?.type === "PROJECT_MANAGER"
      ? "project_manager"
      : invitationData?.type === "DESIGNER"
      ? "designer"
      : "developer";

  const form = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      email: invitationData?.email || email || "",
      type: defaultType,
      name: "",
      password: "",
      phoneNumber: "",
      developerFields:
        defaultType === "project_manager" || defaultType === "designer"
          ? undefined
          : {
              primaryRole: [],
            },
      startupFields: undefined,
      teamLeadFields:
        defaultType === "project_manager"
          ? {
              basicInfo: {
                fullName: "",
                email: invitationData?.email || email || "",
                country: "",
                phoneNumber: "",
              },
              profiles: {
                personalWebsite: "",
                github: "",
                xProfile: "",
              },
              experience: {
                professionalPMExperience: "2-3 years" as const,
                startupExperience: "1-2 years" as const,
                projectSpecialties: [],
              },
              availability: {
                availabilityHours: "1-2 hours" as const,
                greatSoftwareDefinition: "",
                projectManagementDescription: "",
              },
            }
          : undefined,
      designerFields:
        defaultType === "designer"
          ? {
              basicInfo: {
                fullName: "",
                email: invitationData?.email || email || "",
                country: "",
                phoneNumber: "",
              },
              profiles: {
                portfolioType: "Personal Website (Preferred)" as const,
                portfolioUrl: "",
                dribbbleProfile: "",
                behanceProfile: "",
                layersProfile: "",
              },
              experience: {
                professionalDesignExperience: "2-3 years" as const,
                startupExperience: "0-1 years" as const,
                resume: null,
                designWorkTypes: [],
              },
              availability: {
                availabilityHours: "1-2 hours" as const,
                qualityOverDelivery: "",
                favoriteProducts: "",
              },
            }
          : undefined,
    },
  });

  // Watch for form changes to update validation
  const accountType = form.watch("type");

  const validateDesignerStep = (
    step: number,
    data: DesignerFormData
  ): string[] => {
    const errors: string[] = [];

    switch (step) {
      case 1:
        if (!data.basicInfo.fullName.trim()) {
          errors.push("Full name is required");
        }
        if (!data.basicInfo.email.trim()) {
          errors.push("Email is required");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.basicInfo.email)) {
          errors.push("Please enter a valid email address");
        }
        if (!data.basicInfo.country.trim()) {
          errors.push("Country is required");
        }
        break;

      case 2:
        if (!data.profiles.portfolioUrl.trim() &&
        !/^https?:\/\/.+/.test(data.profiles.portfolioUrl)) {
          errors.push("Portfolio URL is required");
        }
        break;

      case 3:
        if (data.experience.designWorkTypes.length === 0) {
          errors.push("At least one design work type must be selected");
        }
        break;

      case 4:
        if (!data.availability.qualityOverDelivery.trim()) {
          errors.push("Quality over delivery description is required");
        } else if (
          data.availability.qualityOverDelivery.trim().length < 10
        ) {
          errors.push("Quality over delivery description must be at least 10 characters");
        }
        if (!data.availability.favoriteProducts.trim()) {
          errors.push("Favorite products description is required");
        } else if (
          data.availability.favoriteProducts.trim().length < 10
        ) {
          errors.push(
            "Favorite products description must be at least 10 characters"
          );
        }
        break;
    }

    return errors;
  };

  const validateTeamLeadStep = (
    step: number,
    data: TeamLeadFormData
  ): string[] => {
    const errors: string[] = [];

    switch (step) {
      case 1:
        if (!data.basicInfo.fullName.trim()) {
          errors.push("Full name is required");
        }
        if (!data.basicInfo.email.trim()) {
          errors.push("Email is required");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.basicInfo.email)) {
          errors.push("Please enter a valid email address");
        }
        if (!data.basicInfo.country.trim()) {
          errors.push("Country is required");
        }
        break;

      case 2:
        if (!data.profiles.github.trim()) {
          errors.push("GitHub profile is required");
        }
        if (!data.profiles.xProfile.trim()) {
          errors.push("X profile is required");
        }
        if (
          data.profiles.personalWebsite?.trim() &&
          !/^https?:\/\/.+/.test(data.profiles.personalWebsite)
        ) {
          errors.push("Personal website must be a valid URL");
        }
        break;

      case 3:
        if (data.experience.projectSpecialties.length === 0) {
          errors.push("At least one project specialty must be selected");
        }
        break;

      case 4:
        if (!data.availability.greatSoftwareDefinition.trim()) {
          errors.push("Software definition is required");
        } else if (
          data.availability.greatSoftwareDefinition.trim().length < 10
        ) {
          errors.push("Software definition must be at least 10 characters");
        }
        if (!data.availability.projectManagementDescription.trim()) {
          errors.push("Project management description is required");
        } else if (
          data.availability.projectManagementDescription.trim().length < 10
        ) {
          errors.push(
            "Project management description must be at least 10 characters"
          );
        }
        break;
    }

    return errors;
  };

  const onSubmit = async (values: CreateAccountFormData) => {
    setIsLoading(true);

    try {
      if (values.type === "project_manager" && values.teamLeadFields) {
        const step1Errors = validateTeamLeadStep(1, values.teamLeadFields);
        const step2Errors = validateTeamLeadStep(2, values.teamLeadFields);
        const step3Errors = validateTeamLeadStep(3, values.teamLeadFields);
        const step4Errors = validateTeamLeadStep(4, values.teamLeadFields);

        const allErrors = [
          ...step1Errors,
          ...step2Errors,
          ...step3Errors,
          ...step4Errors,
        ];

        if (allErrors.length > 0) {
          toast.error("Please complete all required fields", {
            description: allErrors[0],
          });
          setIsLoading(false);
          return;
        }
      }

      if (values.type === "designer" && values.designerFields) {
        const step1Errors = validateDesignerStep(1, values.designerFields);
        const step2Errors = validateDesignerStep(2, values.designerFields);
        const step3Errors = validateDesignerStep(3, values.designerFields);
        const step4Errors = validateDesignerStep(4, values.designerFields);

        const allErrors = [
          ...step1Errors,
          ...step2Errors,
          ...step3Errors,
          ...step4Errors,
        ];

        if (allErrors.length > 0) {
          toast.error("Please complete all required fields", {
            description: allErrors[0],
          });
          setIsLoading(false);
          return;
        }
      }

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, values);
      setEmail(values.email);

      toast.success("Account created successfully!");

      if (values.type === "project_manager") {
        router.push("/auth/create-account/success?type=project_manager");
      } else if (values.type === "designer") {
        router.push("/auth/create-account/success?type=designer");
      } else {
        const primaryRole =
          values.developerFields?.primaryRole?.[0] || "developer";
        router.push(
          `/auth/create-account/challenge?role=${encodeURIComponent(primaryRole)}`
        );
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to validate current form state
  const isFormValid = (): boolean => {
    const formState = form.formState;
    return formState.isValid && !formState.isValidating;
  };

  // Helper function to check if a specific field has errors
  const hasFieldError = (fieldName: string): boolean => {
    return !!form.formState.errors[fieldName as keyof CreateAccountFormData];
  };

  // Helper function to get field error message
  const getFieldError = (fieldName: string): string | undefined => {
    const error =
      form.formState.errors[fieldName as keyof CreateAccountFormData];
    return error?.message;
  };

  const resetFormErrors = () => {
    form.clearErrors();
  };

  
  const resetFieldError = (fieldName: string) => {
    form.clearErrors(fieldName as keyof CreateAccountFormData);
  };

  return {
    form: form as UseFormReturn<CreateAccountFormData>,
    isLoading,
    showPassword,
    setShowPassword,
    isFormValid,
    hasFieldError,
    getFieldError,
    resetFormErrors,
    resetFieldError,
    setIsLoading,
  };
};
