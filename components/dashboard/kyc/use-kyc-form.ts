"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/dashboard";
import { personalInfoSchema, PersonalInfoFormData } from "./personal-info-form";
import { businessInfoSchema, BusinessInfoFormData } from "./business-info-form";
import { bankingInfoSchema, BankingInfoFormData } from "./banking-info-form";
import { toast } from "sonner";
import { useUserData } from "@/hooks/use-user-data";

type BankFormat = {
  accountFormat: string;
  routingFormat: string;
  name: string;
};

// Function to get bank account format example based on country
export const getBankFormatExample = (countryCode: string | null | undefined): BankFormat => {
  const examples: Record<string, BankFormat> = {
    US: {
      accountFormat: "123456789012",
      routingFormat: "XXXXXXXXX (9 digits)",
      name: "United States",
    },
    GB: {
      accountFormat: "12345678",
      routingFormat: "XXXXX-XXXXXXXX (Sort Code)",
      name: "United Kingdom",
    },
    DE: {
      accountFormat: "DE89 3704 0044 0532 0130 00",
      routingFormat: "DEUTDEBBXXX (BIC)",
      name: "Germany",
    },
    FR: {
      accountFormat: "FR76 3000 6000 0112 3456 7890 189",
      routingFormat: "AGRIFRPPXXX (BIC)",
      name: "France",
    },
    // Add more countries as needed
  };

  return examples[countryCode || "US"] || examples["US"];
};

export function useKycForm() {
  const { user, loading: userLoading, refetch: refetchUser } = useUserData();
  const [activeTab, setActiveTab] = useState("personal");
  const [bankFormat, setBankFormat] = useState<BankFormat>({
    accountFormat: "",
    routingFormat: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set bank format based on user's country
  useEffect(() => {
    if (user) {
      const format = getBankFormatExample(user.country);
      setBankFormat(format);
    }
  }, [user]);

  const handlePersonalSubmit = async (data: PersonalInfoFormData) => {
    console.log("Personal form data:", data);
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/kyc/personal-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit personal information');
      }

      // Refresh user data to get updated KYC status
      await refetchUser();
      
      toast.success("Personal information saved");
      
      // Change tab based on user type
      if (user?.type === "startup") {
        setActiveTab("business");
      } else {
        setActiveTab("banking");
      }
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessSubmit = async (data: BusinessInfoFormData) => {
    console.log("Business form data:", data);
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/kyc/business-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit business information');
      }

      // Refresh user data to get updated KYC status
      await refetchUser();
      
      toast.success("Business information submitted for verification");
      
      // Submit for verification
      // submitVerification();
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleBankingSubmit = async (data: BankingInfoFormData) => {
    console.log("Banking form data:", data);
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/kyc/banking-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit banking information');
      }

      // Refresh user data to get updated KYC status
      await refetchUser();
      
      toast.success("Banking information submitted for verification");
      
      // Submit for verification
      // submitVerification();
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    userLoading,
    loading,
    error,
    activeTab,
    setActiveTab,
    bankFormat,
    handlePersonalSubmit,
    handleBusinessSubmit,
    handleBankingSubmit,
  };
}

export default useKycForm; 