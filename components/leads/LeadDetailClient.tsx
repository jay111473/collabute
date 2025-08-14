"use client";

import { FC } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Github, 
  Star, 
  Code,
  ExternalLink,
  Briefcase,
  Clock,
  Award
} from "lucide-react";
import {
  EnhancedUser,
  getProfilePictureUrl,
  getPrimaryRole,
  getLocation,
  getGithubProfile,
  getJoinDate,
  getBirthDate,
  getExperienceYears,
  calculateRating,
  getIndustry,
  getSkillSet,
  getCurrentProjectCount,
  getGithubDisplayText,
} from "@/lib/utils/user-profile";

interface LeadDetailClientProps {
  lead: EnhancedUser;
}

/**
 * Lead detail page component using real API data
 */
const LeadDetailClient: FC<LeadDetailClientProps> = ({ lead }) => {
  // Extract and prepare data using utility functions
  const profilePictureUrl = getProfilePictureUrl(lead);
  const joinDate = getJoinDate(lead);
  const birthDate = getBirthDate(lead);
  const currentProjects = getCurrentProjectCount(lead);
  const experience = getExperienceYears(lead);
  const rating = calculateRating(lead);
  const industry = getIndustry(lead);
  const specialties = getSkillSet(lead);
  const primaryRole = getPrimaryRole(lead);
  const location = getLocation(lead);
  const githubProfile = getGithubProfile(lead);
  const githubDisplayText = getGithubDisplayText(lead);

  // Use real projects data from the lead object
  const recentProjects = lead.recentProjects || [];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 px-6 py-4 text-sm text-gray-400">
        <Link 
          href="/dashboard/leads" 
          className="hover:text-white transition-colors"
        >
          Explore Project leads
        </Link>
        <span>/</span>
        <span className="text-white">{lead.name || "Cameron Williamson"}</span>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-8">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 border-2 border-gray-800">
              <AvatarImage src={profilePictureUrl} />
              <AvatarFallback className="bg-darkGray text-white text-2xl">
                {lead.name?.[0] || "C"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-white">
                  {lead.name || "Cameron Williamson"}
                </h1>
                <span className="text-gray-400 text-lg">@{lead.email?.split('@')[0] || "camreon1234"}</span>
              </div>

              <Badge className="inline-flex items-center gap-2 rounded-full border border-gray-600/70 px-4 py-2 text-sm text-white/90 bg-transparent mb-4">
                <Code className="h-4 w-4 text-gray-300" />
                {primaryRole}
              </Badge>

              {/* Meta Information */}
              <div className="flex items-center gap-6 text-sm text-gray-400 flex-wrap mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{location}</span>
                </div>
                {birthDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Born {birthDate}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined: {joinDate}</span>
                </div>
                {githubProfile && (
                  <a
                    href={githubProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    <span>{githubDisplayText}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          <Button className="bg-purple-600 text-white hover:bg-purple-700 px-8 py-2 rounded-lg">
            Invite
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div className="text-center">
            <p className="text-4xl font-bold text-white mb-1">{currentProjects}</p>
            <p className="text-sm text-gray-400">Current Projects</p>
          </div>

          <div className="text-center">
            <p className="text-4xl font-bold text-white mb-1">+{experience}</p>
            <p className="text-sm text-gray-400">Years Experience</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="h-5 w-5 text-purple-400 fill-current" />
              <p className="text-4xl font-bold text-white">{rating}</p>
            </div>
            <p className="text-sm text-gray-400">Rating</p>
          </div>
        </div>

        {/* Skill Set Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Skill set</h3>
          <div className="flex flex-wrap gap-3">
            {specialties.length > 0 ? specialties.map((skill, index) => (
              <Badge 
                key={index} 
                className="bg-darkGray text-white border border-gray-700 rounded-full px-4 py-2 text-sm"
              >
                {skill}
              </Badge>
            )) : (
              <>
                <Badge className="bg-darkGray text-white border border-gray-700 rounded-full px-4 py-2 text-sm">React/React js</Badge>
                <Badge className="bg-darkGray text-white border border-gray-700 rounded-full px-4 py-2 text-sm">Next js</Badge>
                <Badge className="bg-darkGray text-white border border-gray-700 rounded-full px-4 py-2 text-sm">HTML/Css</Badge>
                <Badge className="bg-darkGray text-white border border-gray-700 rounded-full px-4 py-2 text-sm">Next js</Badge>
                <Badge className="bg-darkGray text-white border border-gray-700 rounded-full px-4 py-2 text-sm">HTML/Css</Badge>
              </>
            )}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
          <div className="flex items-center gap-3 flex-wrap">
            {lead.achievements && lead.achievements.length > 0 ? (
              lead.achievements.map((achievement, index) => (
                <Badge 
                  key={index}
                  className="border rounded-full px-4 py-2 text-sm flex items-center gap-2"
                  style={{
                    backgroundColor: `${achievement.badgeColor || '#fbbf24'}20`,
                    borderColor: `${achievement.badgeColor || '#fbbf24'}50`,
                    color: achievement.badgeColor || '#fbbf24'
                  }}
                >
                  <Award className="h-4 w-4" />
                  {achievement.name}
                </Badge>
              ))
            ) : (
              <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full px-4 py-2 text-sm flex items-center gap-2">
                <Award className="h-4 w-4" />
                Pro developer
              </Badge>
            )}
          </div>
        </div>

        {/* Recent Projects Section */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-6">Recent Projects</h3>
          <div className="space-y-4">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div 
                  key={project._id} 
                  className="flex items-center gap-4 p-4 bg-darkGray rounded-lg border border-gray-800"
                >
                  <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{project.title}</h4>
                    <p className="text-sm text-gray-400">
                      {project.tags.length > 0 ? project.tags.join(", ") : project.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recent projects to display</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailClient;
