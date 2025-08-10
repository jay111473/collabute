import { User } from "./convex";

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

export type AccountType = "developer" | "startup" | "project_manager";

export type ExperienceDuration = "0-1 years" | "1-2 years" | "2-3 years" | "4-5 years" | "6-7 years" | "8-10 years" | "+10 years";
export type AvailabilityHours = "1-2 hours" | "3-4 hours" | "5-6 hours" | "7-8 hours" | "Full-time availability (8+ hours)";
export type ProjectSpecialty = 
  | "SaaS Platform Design"
  | "E-commerce Design"
  | "Mobile App Design"
  | "Landing Page Design"
  | "Brand Identity Design"
  | "Dashboard/Data Visualization"
  | "Marketplace Design";

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

export interface TeamLeadBasicInfo {
  fullName: string;
  email: string;
  country: string;
  phoneNumber?: string;
}

export interface TeamLeadProfiles {
  personalWebsite?: string;
  github: string;
  xProfile: string;
}

export interface TeamLeadExperience {
  professionalPMExperience: ExperienceDuration;
  startupExperience: ExperienceDuration;
  resume?: File | null;
  projectSpecialties: ProjectSpecialty[];
}

export interface TeamLeadAvailability {
  availabilityHours: AvailabilityHours;
  greatSoftwareDefinition: string;
  projectManagementDescription: string;
}

export interface TeamLeadFormData {
  basicInfo: TeamLeadBasicInfo;
  profiles: TeamLeadProfiles;
  experience: TeamLeadExperience;
  availability: TeamLeadAvailability;
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
  teamLeadFields?: TeamLeadFormData;
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
  teamLeadFields?: TeamLeadFormData;
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
