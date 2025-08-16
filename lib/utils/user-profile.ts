/**
 * User profile utility functions
 * Shared utilities for extracting and formatting user profile data
 */

import { 
  User, 
  Media, 
  LeadProfile, 
  DeveloperProfile, 
  ProjectManagerProfile,
  GithubProfile 
} from "@/types/convex";

export interface EnhancedUser extends User {
  leadFields?: LeadProfile;
  developerFields?: DeveloperProfile;
  projectManagerFields?: ProjectManagerProfile;
  githubProfile?: GithubProfile;
  rating?: {
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: { 1: number; 2: number; 3: number; 4: number; 5: number };
  };
  achievements?: Array<{
    name: string;
    description?: string;
    icon?: string;
    badgeColor?: string;
    category: string;
  }>;
  recentProjects?: Array<{
    _id: string;
    title: string;
    description: string;
    tags: string[];
    status: string;
    type?: string;
  }>;
}

/**
 * Formats a date to a readable string (Month Year)
 */
export const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
    date
  );

/**
 * Formats a date to a more detailed readable string (Month Day, Year)
 */
export const formatDetailedDate = (date: Date): string =>
  new Intl.DateTimeFormat("en-US", { 
    month: "long", 
    day: "numeric",
    year: "numeric" 
  }).format(date);

/**
 * Extracts the profile picture URL from a user
 */
export const getProfilePictureUrl = (user: EnhancedUser): string | undefined =>
  user.profilePicture && typeof user.profilePicture === "object"
    ? (user.profilePicture as Media).url || undefined
    : undefined;

/**
 * Gets experience years from different profile types
 */
export const getExperienceYears = (user: EnhancedUser): number => {
  // Check lead fields first
  if (user.leadFields?.managementExperience) {
    return user.leadFields.managementExperience;
  }
  
  // Check developer fields
  if (user.developerFields?.experience) {
    return user.developerFields.experience;
  }
  
  // Check project manager fields - parse from string
  if (user.projectManagerFields?.professionalPMExperience) {
    const experience = user.projectManagerFields.professionalPMExperience;
    if (experience.includes("+10")) return 10;
    const match = experience.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
  
  return 0;
};

/**
 * Gets the user's rating from the rating system, with fallback calculation
 */
export const calculateRating = (user: EnhancedUser): number => {
  // Use real rating data if available
  if (user.rating && user.rating.totalReviews > 0) {
    return user.rating.averageRating;
  }

  // Fallback calculation for users without reviews
  const experience = getExperienceYears(user);
  const projectCount = user.projects?.length || 0;
  let rating = 3.5;

  if (experience >= 8) rating += 1.0;
  else if (experience >= 5) rating += 0.7;
  else if (experience >= 3) rating += 0.4;

  if (projectCount >= 10) rating += 0.4;
  else if (projectCount >= 5) rating += 0.2;

  return Math.min(5.0, Math.round(rating * 10) / 10);
};

/**
 * Gets the primary role for display from different profile types
 */
export const getPrimaryRole = (user: EnhancedUser): string => {
  // Check lead fields for title
  if (user.leadFields?.title) {
    return user.leadFields.title;
  }
  
  // Check developer fields for primary role
  if (user.developerFields?.primaryRole && user.developerFields.primaryRole.length > 0) {
    return user.developerFields.primaryRole[0];
  }
  
  // For project managers, return a static role
  if (user.type === "PROJECT_MANAGER") {
    return "Project Manager";
  }
  
  // Default based on user type
  switch (user.type) {
    case "DEVELOPER":
      return "Developer";
    case "DESIGNER":
      return "Designer";
    case "STARTUP":
      return "Startup Founder";
    case "LEAD":
      return "Technical Lead";
    default:
      return "Technical product manager";
  }
};

/**
 * Gets location information from user profiles
 */
export const getLocation = (user: EnhancedUser): string =>
  user.leadFields?.location || 
  user.country || 
  "Location not specified";

/**
 * Gets GitHub profile URL from multiple sources
 */
export const getGithubProfile = (user: EnhancedUser): string | undefined => {
  // Check multiple sources for GitHub profile URL
  return user.githubProfile?.githubUsername
    ? `https://github.com/${user.githubProfile.githubUsername}`
    : user.projectManagerFields?.githubProfile ||
        user.developerFields?.githubProfile ||
        undefined;
};

/**
 * Gets formatted join date
 */
export const getJoinDate = (user: EnhancedUser): string =>
  user._creationTime ? formatDate(new Date(user._creationTime)) : "Recently joined";

/**
 * Gets formatted birth date
 */
export const getBirthDate = (user: EnhancedUser): string | undefined =>
  user.birthDate ? formatDetailedDate(new Date(user.birthDate)) : undefined;

/**
 * Gets skill set from different profile types
 */
export const getSkillSet = (user: EnhancedUser): string[] => {
  // Check lead specializations
  if (user.leadFields?.specializations && user.leadFields.specializations.length > 0) {
    return user.leadFields.specializations;
  }
  
  // Check project manager specialties
  if (user.projectManagerFields?.projectSpecialties && user.projectManagerFields.projectSpecialties.length > 0) {
    return user.projectManagerFields.projectSpecialties;
  }
  
  // Check developer skills
  if (user.developerFields?.skills && user.developerFields.skills.length > 0) {
    return user.developerFields.skills.map(skill => 
      typeof skill === "object" ? skill.skill : skill
    );
  }
  
  // Default fallback skills
  return ["React", "TypeScript", "Node.js"];
};

/**
 * Gets industry information from user profiles
 */
export const getIndustry = (user: EnhancedUser): string => {
  const specialties = user.projectManagerFields?.projectSpecialties || [];
  const specialtiesText = specialties.join(" ").toLowerCase();
  
  if (specialtiesText.includes("saas")) {
    return "SaaS, Web Applications";
  }
  if (specialtiesText.includes("e-commerce") || specialtiesText.includes("marketplace")) {
    return "E-commerce, Marketplace";
  }
  if (specialtiesText.includes("mobile")) {
    return "Mobile Apps, Software";
  }
  if (specialtiesText.includes("enterprise")) {
    return "Enterprise Software";
  }
  if (specialtiesText.includes("dashboard") || specialtiesText.includes("analytics")) {
    return "Data, Analytics";
  }

  // Default based on role
  const role = getPrimaryRole(user);
  if (role.toLowerCase().includes("frontend") || role.toLowerCase().includes("full stack")) {
    return "SaaS, Mobile Apps, AI";
  }
  if (role.toLowerCase().includes("backend") || role.toLowerCase().includes("devops")) {
    return "Web3, Crypto, Finance";
  }

  return "Tech, Software Development";
};

/**
 * Gets all specialties/skills from a user as a comma-separated string
 */
export const getSpecialtiesAsString = (user: EnhancedUser): string => {
  const skills = getSkillSet(user);
  return skills.length > 0 ? skills.join(", ") : "Not specified";
};

/**
 * Gets current project count
 */
export const getCurrentProjectCount = (user: EnhancedUser): number => {
  return user.projects?.length || 0;
};

/**
 * Checks if user has GitHub profile
 */
export const hasGithubProfile = (user: EnhancedUser): boolean => {
  return getGithubProfile(user) !== undefined;
};

/**
 * Gets formatted GitHub display text
 */
export const getGithubDisplayText = (user: EnhancedUser): string | undefined => {
  const githubUrl = getGithubProfile(user);
  return githubUrl ? githubUrl.replace("https://github.com/", "Github.com/") : undefined;
};
