"use client";

import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Github, Star } from "lucide-react";
import { User, Media, LeadProfile } from "@/types/convex";
import { useRouter, useSearchParams } from "next/navigation";

interface EnhancedUser extends User {
  leadFields?: LeadProfile;
}

interface TeamLeadCardProps {
  teamLead: EnhancedUser;
}

// Helpers
const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
    date
  );

const getProfilePictureUrl = (teamLead: EnhancedUser): string | undefined =>
  teamLead.profilePicture && typeof teamLead.profilePicture === "object"
    ? (teamLead.profilePicture as Media).url || undefined
    : undefined;

const getExperienceYears = (teamLead: EnhancedUser): number =>
  (teamLead.leadFields as any)?.managementExperience || 0;

const calculateRating = (teamLead: EnhancedUser): number => {
  const experience = getExperienceYears(teamLead);
  const projectCount = teamLead.projects?.length || 0;
  let rating = 3.5;

  if (experience >= 8) rating += 1.0;
  else if (experience >= 5) rating += 0.7;
  else if (experience >= 3) rating += 0.4;

  if (projectCount >= 10) rating += 0.4;
  else if (projectCount >= 5) rating += 0.2;

  return Math.min(5.0, Math.round(rating * 10) / 10);
};

const getPrimaryRole = (teamLead: EnhancedUser): string =>
  teamLead.leadFields?.title || "Technical product manager";

const getLocation = (teamLead: EnhancedUser): string =>
  teamLead.leadFields?.location || teamLead.country || "United States";

const getGithubProfile = (teamLead: EnhancedUser): string | undefined =>
  (teamLead as any).githubProfile;

const getJoinDate = (teamLead: EnhancedUser): string =>
  teamLead.createdAt ? formatDate(new Date(teamLead.createdAt)) : "May 2024";

const getSkillSet = (teamLead: EnhancedUser): string[] => {
  const specializations = teamLead.leadFields?.specializations || [];
  return specializations.length === 0
    ? ["React/React js", "Next js", "HTML/Css", "Next js", "HTML/Css"]
    : specializations;
};

const TeamLeadCard: FC<TeamLeadCardProps> = ({ teamLead }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const profilePictureUrl = getProfilePictureUrl(teamLead);
  const primaryRole = getPrimaryRole(teamLead);
  const location = getLocation(teamLead);
  const joinDate = getJoinDate(teamLead);
  const githubProfile = getGithubProfile(teamLead);
  const experience = getExperienceYears(teamLead);
  const rating = calculateRating(teamLead);
  const currentProjects = teamLead.projects?.length || 0;
  const skillSet = getSkillSet(teamLead);

  return (
    <div className="space-y-4">
      <Card className="bg-[#1a1a1a] border-none rounded-lg p-6 relative">
        <div className="flex justify-end items-center gap-x-4">
          <button
            onClick={() => {}} // to be used to invite team lead , leaving empty for now
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            Invite
          </button>
        </div>

        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profilePictureUrl} />
            <AvatarFallback>{teamLead.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-white text-lg font-semibold">
              {teamLead.name || "Unnamed User"}
            </h2>
            <p className="text-gray-400 text-sm">
              @{teamLead.name?.toLowerCase().replace(/\s+/g, "") || "username"}
            </p>
            <Badge className="mt-2 bg-gray-800 text-white border-none">
              {primaryRole}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-gray-400 text-sm mt-4">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          {teamLead.leadFields?.calendar?.[0] && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{teamLead.leadFields.calendar[0]}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Joined: {joinDate}</span>
          </div>
          {githubProfile && (
            <a
              href={githubProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>{githubProfile}</span>
            </a>
          )}
        </div>

        <div className="grid grid-cols-3 text-center mt-6">
          <div>
            <p className="text-white text-xl font-semibold">
              {currentProjects}
            </p>
            <p className="text-gray-400 text-xs">Current Projects</p>
          </div>
          <div className="border-x border-gray-700">
            <p className="text-white text-xl font-semibold">+{experience}</p>
            <p className="text-gray-400 text-xs">Years Experience</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <Star className="h-4 w-4 text-purple-400 fill-purple-400" />
              <p className="text-white text-xl font-semibold">{rating}</p>
            </div>
            <p className="text-gray-400 text-xs">Rating</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-white text-sm font-semibold">Skill set</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {skillSet.map((skill, i) => (
              <Badge
                key={i}
                className="bg-gray-800 text-white border-none rounded-full px-3 py-1 text-xs"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-white text-sm font-semibold">Achievements</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg">🏆</span>
            <Badge className="bg-gray-800 text-white border-none px-3 py-1 text-xs">
              Pro developer
            </Badge>
          </div>
        </div>
      </Card>

      {teamLead.projects && teamLead.projects.length > 0 && (
        <Card className="bg-[#1a1a1a] border-none rounded-lg p-6">
          <h3 className="text-white text-sm font-semibold mb-4">
            Recent Projects
          </h3>
          <div className="space-y-4">
            {teamLead.projects.map((projectId, i) => (
              <div
                key={i}
                className="flex justify-between items-center border-b border-gray-800 pb-2 last:border-none"
              >
                <div>
                  <p className="text-white text-sm">Project {i + 1}</p>
                  <p className="text-gray-400 text-xs">Description here...</p>
                </div>
                <p className="text-gray-400 text-xs">Some time ago</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default TeamLeadCard;
