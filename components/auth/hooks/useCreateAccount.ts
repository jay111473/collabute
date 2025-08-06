import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { useEmail } from "@/app/providers/EmailContext";
import type { CreateAccountFormData } from "@/types/auth.types";
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

export const useCreateAccount = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { email, setEmail } = useEmail();

  const form = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      email: email || "",
      type: "developer",
      phoneNumber: "",
      countryCode: "",
      developerFields: {
        primaryRole: [],
      },
    },
  });

  const onSubmit = async (values: CreateAccountFormData) => {
    setIsLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, values);
      setEmail(values.email);
      
      // Use the first selected role for navigation, or 'developer' as fallback
      const primaryRole = values.developerFields?.primaryRole?.[0] || 'developer';
      router.push(
        `/auth/create-account/challenge?role=${encodeURIComponent(primaryRole)}`
      );
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    showPassword,
    setShowPassword,
    onSubmit,
  };
};
