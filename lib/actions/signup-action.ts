"use server";

import type {
  AccountType,
  CreateAccountFormData,
  CreateAccountResponse,
  DeveloperRole,
  TeamSize,
} from "@/types/auth.types";
import { signinAction } from "./signin-action";
import { signup } from "../auth-server";

export const signupAction = async (
  _prevState: unknown,
  formData: FormData
): Promise<CreateAccountResponse | { error: string }> => {
  // Extract basic user data
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const type = formData.get("type") as AccountType;
  const phoneNumber = formData.get("phoneNumber") as string;
  const countryCode = formData.get("countryCode") as string;

  // Prepare API payload based on account type
  const payload: Partial<CreateAccountFormData> = {
    email,
    password,
    name,
    type,
    phoneNumber,
    countryCode,
  };

  if (type === "developer") {
    // Handle the primaryRoles array format
    const primaryRolesData = formData.get("developerFields.primaryRole");
    let primaryRole: DeveloperRole[] = [];
    
    if (primaryRolesData) {
      try {
        primaryRole = JSON.parse(primaryRolesData as string);
      } catch {
        // Fallback to empty array if parsing fails
        primaryRole = [];
      }
    }
    
    // Send primaryRole as array to match backend expectations
    payload.developerFields = {
      primaryRole: primaryRole,
    };
  } else if (type === "startup") {
    payload.startupFields = {
      companyName: (formData.get("startupFields.companyName") || formData.get("companyName")) as string,
      teamSize: (formData.get("startupFields.teamSize") || formData.get("teamSize")) as TeamSize,
    };
  }

  try {
    // First sign up the user
    await signup(payload);
    
    // Then sign in with the new credentials
    const loginResult = await signinAction(null, formData);
    
    // Check login result
    if ('error' in loginResult) {
      console.error("Auto-login failed after signup:", loginResult.error);
      // Still return success for signup, but note login failed
      return { 
        success: true, 
        message: "Account created successfully, but auto-login failed. Please log in manually."
      };
    }
    
    // Successful signup and login
    return { 
      success: true, 
      message: "Signed up and logged in successfully!", 
      userId: loginResult.user?.id 
    };
  } catch (error) {
    console.error("Signup error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to sign up";
    return { error: errorMessage };
  }
};
