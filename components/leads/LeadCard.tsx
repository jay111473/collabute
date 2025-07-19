"use client";

import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Github, Star, Bookmark, Code } from "lucide-react";
import { User, Media, Stack } from "@/types/dashboard";

interface ProjectManagerCardProps {
  projectManager: User;
  variant?: "featured" | "compact";
}

/**
 * Formats a date to a readable string (Month Year)
 */
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
};

/**
 * Extracts the profile picture URL from a project manager
 */
const getProfilePictureUrl = (projectManager: User): string | undefined => {
  return projectManager.profilePicture &&
    typeof projectManager.profilePicture === "object"
    ? (projectManager.profilePicture as Media).url || undefined
    : undefined;
};

/**
 * Extracts stack names from a project manager
 */
const getStackNames = (projectManager: User): string => {
  return (
    projectManager?.projectManagerFields?.stack
      ?.map((stack) => (typeof stack === "object" ? (stack as Stack).name : ""))
      .filter(Boolean)
      .join(", ") || ""
  );
};

/**
 * Gets skills from a project manager (stack names or skills)
 */
const getSkills = (projectManager: User): string => {
  const stackNames = getStackNames(projectManager);
  const skills = projectManager.developerFields?.skills
    ?.map((skill) => skill.skill)
    .join(", ");

  return stackNames || skills || "Not specified";
};

/**
 * Gets the primary role for display
 */
const getPrimaryRole = (projectManager: User): string => {
  if (projectManager.developerFields?.primaryRole) {
    return projectManager.developerFields.primaryRole[0];
  }

  if (
    projectManager.developerFields?.primaryRole &&
    Array.isArray(projectManager.developerFields.primaryRole)
  ) {
    return projectManager.developerFields.primaryRole[0] || "Project Manager";
  }

  return "Project Manager";
};

/**
 * Gets industry information from available fields
 */
const getIndustry = (projectManager: User): string => {
  // Try to derive industry from stack or skills
  const stackNames = getStackNames(projectManager);
  if (
    stackNames.toLowerCase().includes("web3") ||
    stackNames.toLowerCase().includes("crypto")
  ) {
    return "Web3, Crypto, Finance";
  }
  if (
    stackNames.toLowerCase().includes("mobile") ||
    stackNames.toLowerCase().includes("ios") ||
    stackNames.toLowerCase().includes("android")
  ) {
    return "SaaS, Mobile Apps, AI";
  }
  if (
    stackNames.toLowerCase().includes("design") ||
    stackNames.toLowerCase().includes("ui") ||
    stackNames.toLowerCase().includes("ux")
  ) {
    return "Design, Tech, E-commerce";
  }

  // Default based on role
  const role = getPrimaryRole(projectManager);
  if (
    role.toLowerCase().includes("frontend") ||
    role.toLowerCase().includes("full stack")
  ) {
    return "SaaS, Mobile Apps, AI";
  }
  if (
    role.toLowerCase().includes("backend") ||
    role.toLowerCase().includes("devops")
  ) {
    return "Web3, Crypto, Finance";
  }

  return "Tech, Software Development";
};

/**
 * Calculates a mock rating based on experience and projects
 */
const calculateRating = (projectManager: User): number => {
  const experience = projectManager.developerFields?.experience || 0;
  const projectCount = projectManager.projects?.length || 0;

  // Base rating on experience and projects
  let rating = 3.5; // Base rating

  if (experience >= 8) rating += 1.0;
  else if (experience >= 5) rating += 0.7;
  else if (experience >= 3) rating += 0.4;

  if (projectCount >= 10) rating += 0.4;
  else if (projectCount >= 5) rating += 0.2;

  return Math.min(5.0, Math.round(rating * 10) / 10);
};

/**
 * Project Manager card component with two variants: featured (large visual) and compact (detailed list)
 */
const ProjectManagerCard: FC<ProjectManagerCardProps> = ({
  projectManager,
  variant = "compact",
}) => {
  // Extract and prepare data
  const profilePictureUrl = getProfilePictureUrl(projectManager);
  const joinDate = projectManager.createdAt
    ? formatDate(new Date(projectManager.createdAt))
    : "Unknown";
  const currentProjects = projectManager.projects?.length || 0;
  const developmentProjects =
    (projectManager.projects?.length || 0) + currentProjects;
  const experience = projectManager.developerFields?.experience || 0;
  const rating = calculateRating(projectManager);
  const industry = getIndustry(projectManager);
  const skills = getSkills(projectManager);
  const primaryRole = getPrimaryRole(projectManager);
  const location = projectManager.country || "Location not specified";
  const githubProfile = projectManager.developerFields?.githubProfile;

  if (variant === "featured") {
    return (
      <Card className="bg-darkGray border-none rounded-2xl overflow-hidden w-full relative">
        {/* Bookmark Icon */}
        <button className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-black/20 transition-colors">
          <Bookmark className="h-5 w-5 text-white" />
        </button>

        {/* Large Profile Image */}
        <div className="aspect-[4/3] bg-gradient-to-b from-gray-800 to-gray-900 relative overflow-hidden">
          {profilePictureUrl ? (
            <img
              src={profilePictureUrl}
              alt={projectManager.name}
              className="w-full h-full object-cover grayscale"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-700 to-gray-800">
              <div className="text-6xl font-bold text-white opacity-50">
                {projectManager.name[0]}
              </div>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-6">
          {/* Name with Verification */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold text-white">
              {projectManager.name}
            </h3>
            <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Role with Icon */}
          <div className="flex items-center gap-2 mb-3">
            <Code className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400 text-sm">{primaryRole}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400 text-sm">{location}</span>
          </div>

          {/* Stats */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-2xl font-semibold text-white">+{experience}</p>
              <p className="text-sm text-gray-400">Years Experience</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <p className="text-2xl font-semibold text-white">{rating}</p>
              </div>
              <p className="text-sm text-gray-400">Rating</p>
            </div>
          </div>

          {/* Skills */}
          <div>
            <p className="text-sm text-gray-400 mb-2">Skills</p>
            <p className="text-white text-sm">{skills}</p>
          </div>
        </div>
      </Card>
    );
  }

  // Compact variant (original design)
  return (
    <Card className="bg-darkGray border-none rounded-2xl p-6 w-full">
      {/* Header with Avatar and Basic Info */}
      <div className="flex items-start gap-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profilePictureUrl} />
          <AvatarFallback className="bg-black text-white text-lg">
            {projectManager.name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-white">
              {projectManager.name}
            </h3>
            <div className="w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center">
              <svg
                className="w-2.5 h-2.5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-gray-400" />
            <Badge
              className="text-white bg-transparent border-gray-600 px-3 py-1 rounded-[18px] text-sm"
              variant="outline"
            >
              {primaryRole}
            </Badge>
          </div>
        </div>
      </div>

      {/* Location, Join Date, and GitHub */}
      <div className="flex items-center gap-4 mb-6 text-sm text-gray-400 flex-wrap">
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Joined: {joinDate}</span>
        </div>
        {githubProfile && (
          <a
            href={githubProfile}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-400 hover:underline"
          >
            <Github className="h-4 w-4" />
            <span>
              {githubProfile.replace("https://github.com/", "Github.com/")}
            </span>
          </a>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-semibold text-white mb-1">
            {developmentProjects}
          </p>
          <p className="text-sm text-gray-400">Development Projects</p>
        </div>
        <div className="text-center border-x border-gray-700">
          <p className="text-2xl font-semibold text-white mb-1">
            +{experience}
          </p>
          <p className="text-sm text-gray-400">Years Experience</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <p className="text-2xl font-semibold text-white">{rating}</p>
          </div>
          <p className="text-sm text-gray-400">Rating</p>
        </div>
      </div>

      {/* Industry and Skills */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Industry</span>
          <p className="text-white text-sm text-right">{industry}</p>
        </div>
        <div className="flex justify-between items-start">
          <span className="text-sm text-gray-400">Skills</span>
          <p className="text-white text-sm text-right max-w-[60%]">{skills}</p>
        </div>
      </div>
    </Card>
  );
};

export default ProjectManagerCard;
