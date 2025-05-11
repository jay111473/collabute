"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/dashboard";
import { personalInfoSchema, PersonalInfoFormData } from "./personal-info-form";
import { businessInfoSchema, BusinessInfoFormData } from "./business-info-form";
import { bankingInfoSchema, BankingInfoFormData } from "./banking-info-form";
import { toast } from "sonner";

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

// Mock getUser function for fetching user data
export const getUser = async (): Promise<User> => {
  // In a real implementation, this would be an API call
  return {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    type: "developer", // Change this to "startup" to test different form types
    kycStatus: "pending",
    country: "US", // Example country code
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
};

export const useKycForm = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  const [bankFormat, setBankFormat] = useState<BankFormat>({
    accountFormat: "",
    routingFormat: "",
    name: "",
  });

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser();
        setUser(userData);

        // Set bank format based on user's country
        const format = getBankFormatExample(userData.country);
        setBankFormat(format);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handlePersonalSubmit = async (data: PersonalInfoFormData) => {
    console.log("Personal form data:", data);
    
    // In a real implementation, submit data to API
    // await submitPersonalInfo(data);
    
    // Change tab based on user type
    if (user?.type === "startup") {
      setActiveTab("business");
    } else {
      setActiveTab("banking");
    }
    
    toast.success("Personal information saved");
  };

  const handleBusinessSubmit = async (data: BusinessInfoFormData) => {
    console.log("Business form data:", data);
    
    // In a real implementation, submit data to API
    // await submitBusinessInfo(data);
    
    toast.success("Business information submitted for verification");
    
    // Submit for verification
    // submitVerification();
  };

  const handleBankingSubmit = async (data: BankingInfoFormData) => {
    console.log("Banking form data:", data);
    
    // In a real implementation, submit data to API
    // await submitBankingInfo(data);
    
    toast.success("Banking information submitted for verification");
    
    // Submit for verification
    // submitVerification();
  };

  return {
    user,
    setUser,
    loading,
    activeTab,
    setActiveTab,
    bankFormat,
    handlePersonalSubmit,
    handleBusinessSubmit,
    handleBankingSubmit,
  };
};

export default useKycForm; 