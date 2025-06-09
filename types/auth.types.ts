import { User } from "./dashboard";

export type DeveloperRole =
  | "Frontend Developer"
  | "Backend Developer"
  | "Full Stack Developer"
  | "Mobile Developer"
  | "DevOps Engineer"
  | "Data Scientist"
  | "UI/UX Designer"
  | "QA Engineer"
  | "Game Developer"
  | "Embedded Developer"
  | "Scientific Computing"
  | "Systems Engineer"
  | "Data Engineer"
  | "Other";

export type TeamSize = "1-10" | "10-50" | "50-100" | "100+";

export type AccountType = "developer" | "startup";

export interface DeveloperFields {
  primaryRole?: DeveloperRole[] | null;
}

export interface DeveloperFieldsAPI {
  primaryRole?: DeveloperRole | null;
}

export interface StartupFields {
  companyName: string | null;
  teamSize?: TeamSize | null;
}

export interface CreateAccountFormData {
  name: string;
  type: AccountType;
  email: string;
  password: string;
  phoneNumber: string;
  countryCode: string;
  developerFields?: DeveloperFields;
  startupFields?: StartupFields;
}

export interface CreateAccountAPIPayload {
  name: string;
  type: AccountType;
  email: string;
  password: string;
  phoneNumber: string;
  countryCode: string;
  developerFields?: DeveloperFieldsAPI;
  startupFields?: StartupFields;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface CreateAccountResponse {
  success: boolean;
  message: string;
  userId?: number;
} 