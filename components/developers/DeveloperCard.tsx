"use client";

import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Github, Bookmark, Code } from "lucide-react";
import { User } from "@/types/convex";

// Type for developer with profile data
type DeveloperWithProfile = User & {
  developerProfile: {
    bio?: string;
    skills?: string[];
    experience?: number;
    experienceLevel?: string;
    availability?: string;
    hourlyRate?: number;
    portfolio?: string[];
  } | null;
  githubProfile: {
    githubUsername: string;
    publicRepos?: number;
    followers?: number;
  } | null;
  repositoriesCount: number;
  issuesWorkedOn: number;
};

interface DeveloperCardProps {
  developer: DeveloperWithProfile;
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
 * Extracts the profile picture URL from a developer
 */
const getProfilePictureUrl = (developer: DeveloperWithProfile): string | undefined => {
  return developer.image || undefined;
};

/**
 * Gets skills from a developer
 */
const getSkills = (developer: DeveloperWithProfile): string => {
  const skills = developer.developerProfile?.skills?.join(", ");
  return skills || "Not specified";
};

/**
 * Gets the primary role for display
 */
const getPrimaryRole = (developer: DeveloperWithProfile): string => {
  return developer.developerProfile?.experienceLevel || "Developer";
};

/**
 * Gets industry information from explicit user data
 */
const getIndustry = (developer: DeveloperWithProfile): string | null => {
  // Get industry from user data
  const industry = developer.industry;
  if (industry) {
    return industry;
  }

  // If no explicit industry data exists, return null instead of guessing
  return null;
};

/**
 * Developer card component with two variants: featured (large visual) and compact (detailed list)
 */
const DeveloperCard: FC<DeveloperCardProps> = ({
  developer,
  variant = "compact",
}) => {
  // Extract and prepare data
  const profilePictureUrl = getProfilePictureUrl(developer);
  const joinDate = developer._creationTime
    ? formatDate(new Date(developer._creationTime))
    : "Unknown";
  const currentProjects = developer.issuesWorkedOn || 0;
  const developmentProjects = currentProjects;
  const experience = developer.developerProfile?.experience || 0;
  const industry = getIndustry(developer);
  const skills = getSkills(developer);
  const primaryRole = getPrimaryRole(developer);
  const location = developer.country || "Remote";
  const githubProfile = developer.githubProfile;

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
              alt={developer.name || "Developer"}
              className="w-full h-full object-cover grayscale"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-700 to-gray-800">
              <div className="text-6xl font-bold text-white opacity-50">
                {developer.name?.[0] || "D"}
              </div>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-6">
          {/* Name with Verification */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold text-white">
              {developer.name || "Developer"}
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
            {developer.name?.[0] || "D"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-white">
              {developer.name || "Developer"}
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
            href={`https://github.com/${githubProfile.githubUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-400 hover:underline"
          >
            <Github className="h-4 w-4" />
            <span>
              Github.com/{githubProfile.githubUsername}
            </span>
          </a>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-semibold text-white mb-1">
            {developmentProjects}
          </p>
          <p className="text-sm text-gray-400">Development Projects</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-white mb-1">
            +{experience}
          </p>
          <p className="text-sm text-gray-400">Years Experience</p>
        </div>
      </div>

      {/* Industry and Skills */}
      <div className="space-y-3">
        {industry && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Industry</span>
            <p className="text-white text-sm text-right">{industry}</p>
          </div>
        )}
        <div className="flex justify-between items-start">
          <span className="text-sm text-gray-400">Skills</span>
          <p className="text-white text-sm text-right max-w-[60%]">{skills}</p>
        </div>
      </div>
    </Card>
  );
};

export default DeveloperCard;
