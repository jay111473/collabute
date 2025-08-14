"use client";

import { FC } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Github, Star, Code } from "lucide-react";
import {
  EnhancedUser,
  getProfilePictureUrl,
  getPrimaryRole,
  getLocation,
  getGithubProfile,
  getJoinDate,
  getExperienceYears,
  calculateRating,
  getSkillSet,
  getCurrentProjectCount,
  getGithubDisplayText,
} from "@/lib/utils/user-profile";

interface TeamLeadCardProps {
  teamLead: EnhancedUser;
}

const TeamLeadCard: FC<TeamLeadCardProps> = ({ teamLead }) => {
  const router = useRouter();
  const profilePictureUrl = getProfilePictureUrl(teamLead);
  const primaryRole = getPrimaryRole(teamLead);
  const location = getLocation(teamLead);
  const joinDate = getJoinDate(teamLead);
  const githubProfile = getGithubProfile(teamLead);
  const githubDisplayText = getGithubDisplayText(teamLead);
  const experience = getExperienceYears(teamLead);
  const rating = calculateRating(teamLead);
  const currentProjects = getCurrentProjectCount(teamLead);
  const skillSet = getSkillSet(teamLead);

  const handleCardClick = () => {
    if (teamLead.slug) {
      router.push(`/dashboard/leads/${teamLead.slug}`);
    }
  };

  return (
    <div className="space-y-4">
      <Card
        className="bg-[#1a1a1a] border-none rounded-lg p-6 relative cursor-pointer hover:bg-[#1e1e1e] transition-colors"
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profilePictureUrl} />
              <AvatarFallback className="bg-gradient-to-b from-gray-500 to-gray-700">
                {teamLead.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col space-y-3">
              <div className="flex gap-2 items-center">
                <h2 className="text-white text-lg font-semibold">
                  {teamLead.name || "Unnamed User"}
                </h2>
                <p className="text-gray-400 text-sm">
                  @
                  {teamLead.name?.toLowerCase().replace(/\s+/g, "") ||
                    "username"}
                </p>
              </div>

              <div className="mt-1">
                <span className="inline-flex items-center gap-2 rounded-full border border-gray-600/70 px-3 py-1 text-xs text-white/90">
                  <Code className="h-3.5 w-3.5 text-gray-300" />
                  {primaryRole}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-gray-400 text-sm mt-2">
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
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    <span>{githubDisplayText}</span>
                  </a>
                )}
              </div>

              <div>
                <div className="grid grid-cols-3 text-center mt-6 w-full">
                  <div>
                    <p className="text-white text-xl font-semibold">
                      {currentProjects}
                    </p>
                    <p className="text-gray-400 text-xs">Current Projects</p>
                  </div>
                  <div className="border-x border-gray-700">
                    <p className="text-white text-xl font-semibold">
                      +{experience}
                    </p>
                    <p className="text-gray-400 text-xs">Years Experience</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 text-purple-400 fill-purple-400" />
                      <p className="text-white text-xl font-semibold">
                        {rating}
                      </p>
                    </div>
                    <p className="text-gray-400 text-xs">Rating</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-white text-sm font-semibold">
                    Skill set
                  </h3>
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
                  <h3 className="text-white text-sm font-semibold">
                    Achievements
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg">🏆</span>
                    <Badge className="bg-gray-800 text-white border-none px-3 py-1 text-xs">
                      Pro developer
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle invite logic here
            }}
            className="bg-darkPrimary hover:bg-accent text-black text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            Invite
          </button>
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
