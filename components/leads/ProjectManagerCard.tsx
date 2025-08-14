"use client";

import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Github, Star, Bookmark, Code } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  EnhancedUser,
  getProfilePictureUrl,
  getPrimaryRole,
  getLocation,
  getGithubProfile,
  getJoinDate,
  getExperienceYears,
  calculateRating,
  getIndustry,
  getSpecialtiesAsString,
  getCurrentProjectCount,
  getGithubDisplayText,
} from "@/lib/utils/user-profile";

interface ProjectManagerCardProps {
  projectManager: EnhancedUser;
  variant?: "featured" | "compact";
}





/**
 * Project Manager card component with two variants: featured (large visual) and compact (detailed list)
 */
const ProjectManagerCard: FC<ProjectManagerCardProps> = ({
  projectManager,
  variant = "compact",
}) => {
  // Extract and prepare data using utility functions
  const profilePictureUrl = getProfilePictureUrl(projectManager);
  const joinDate = getJoinDate(projectManager);
  const currentProjects = getCurrentProjectCount(projectManager);
  const developmentProjects = currentProjects;
  const experience = getExperienceYears(projectManager);
  const rating = calculateRating(projectManager);
  const industry = getIndustry(projectManager);
  const skills = getSpecialtiesAsString(projectManager);
  const primaryRole = getPrimaryRole(projectManager);
  const location = getLocation(projectManager);
  const githubProfile = getGithubProfile(projectManager);
  const githubDisplayText = getGithubDisplayText(projectManager);

  const router = useRouter();

  if (variant === "featured") {
    return (
      <Card
        className="bg-darkGray border-none rounded-2xl w-full cursor-pointer"
        onClick={() => router.push(`/dashboard/leads/${projectManager.slug || projectManager._id}`)}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profilePictureUrl} />
              <AvatarFallback className="bg-black text-white text-lg">
                {projectManager.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h3 className="text-2xl font-semibold text-white leading-tight">
                {projectManager.name || "Unknown User"}
              </h3>

              <div className="mt-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-gray-600/70 px-3 py-1 text-xs text-white/90">
                  <Code className="h-3.5 w-3.5 text-gray-300" />
                  {primaryRole}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-6 text-xs text-gray-400 flex-wrap">
            <div className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Joined: {joinDate}</span>
            </div>
            {githubProfile && (
              <a
                href={githubProfile}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:underline"
              >
                <Github className="h-4 w-4" />
                <span className="text-xs">
                  {githubDisplayText}
                </span>
              </a>
            )}
          </div>

          <div className="mt-4 border-t border-gray-800/80" />

          <div className="grid grid-cols-3 gap-6 py-4">
            <div className="text-left border-r border-gray-700/80">
              <p className="text-2xl font-semibold text-white">
                {developmentProjects}
              </p>
              <p className="mt-1 text-xs text-gray-400">Current Projects</p>
            </div>

            <div className="text-left border-r border-gray-700/80">
              <p className="text-2xl font-semibold text-white">+{experience}</p>
              <p className="mt-1 text-xs text-gray-400">Years Experience</p>
            </div>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-400 fill-current" />
                <p className="text-2xl font-semibold text-white">{rating}</p>
              </div>
              <p className="mt-1 text-xs text-gray-400">Rating</p>
            </div>
          </div>

          <div className="border-t border-gray-800/80" />

          <div className="divide-y divide-gray-800/80">
            <div className="flex items-center justify-between py-3">
              <span className="text-xs text-gray-400">Industry</span>
              <p className="text-sm text-white text-right">{industry}</p>
            </div>
            <div className="flex items-start justify-between py-3">
              <span className="text-xs text-gray-400">Skills</span>
              <p className="text-sm text-white text-right max-w-[70%]">
                {skills}
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Compact variant (original design)
  return (
    <Card
      className="bg-darkGray border-none rounded-2xl p-6 w-full cursor-pointer"
      onClick={() => router.push(`/dashboard/leads/${projectManager.slug || projectManager._id}`)}
    >
      {/* Header with Avatar and Basic Info */}
      <div className="flex items-start gap-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profilePictureUrl} />
          <AvatarFallback className="bg-black text-white text-lg">
            {projectManager.name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-white">
              {projectManager.name || "Unknown User"}
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
          <div className="mt-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-600/70 px-3 py-1 text-xs text-white/90">
              <Code className="h-3.5 w-3.5 text-gray-300" />
              {primaryRole}
            </span>
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
              {githubDisplayText}
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
