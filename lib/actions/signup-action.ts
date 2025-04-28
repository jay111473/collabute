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

  // Prepare API payload based on account type
  const payload: Partial<CreateAccountFormData> = {
    email,
    password,
    name,
    type,
  };

  if (type === "developer") {
    payload.developerFields = {
      primaryRole: formData.get("developerFields.primaryRole") as DeveloperRole,
    };
  } else if (type === "startup") {
    payload.startupFields = {
      companyName: formData.get("startupFields.companyName") as string,
      teamSize: formData.get("startupFields.teamSize") as TeamSize,
    };
  }

  try {
    await signup(payload);
    signinAction(null, formData);
    return { success: true, message: "Signed up successfully!" };
  } catch (error) {
    return { error: "Failed to sign up" };
  }
};
