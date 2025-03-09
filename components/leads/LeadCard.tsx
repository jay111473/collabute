"use client";

import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Code2, MapPin } from "lucide-react";
import { User, Media, Stack } from "@/types/dashboard";

interface LeadCardProps {
  lead: User;
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
 * Extracts the profile picture URL from a lead
 */
const getProfilePictureUrl = (lead: User): string | undefined => {
  return lead.profilePicture && typeof lead.profilePicture === "object"
    ? (lead.profilePicture as Media).url || undefined
    : undefined;
};

/**
 * Extracts stack names from a lead
 */
const getStackNames = (lead: User): string => {
  return (
    lead.leadFields?.stack
      ?.map((stack) => (typeof stack === "object" ? (stack as Stack).name : ""))
      .filter(Boolean)
      .join(", ") || ""
  );
};

/**
 * Gets industry categories from a lead
 */
const getIndustryCategories = (lead: User): string => {
  return (
    lead.developerFields?.assessment?.categories
      ?.map((cat) => cat.category)
      .join(", ") || "Not specified"
  );
};

/**
 * Gets skills from a lead (stack names or skills)
 */
const getSkills = (lead: User): string => {
  const stackNames = getStackNames(lead);
  const skills = lead.developerFields?.skills
    ?.map((skill) => skill.skill)
    .join(", ");

  return stackNames || skills || "Not specified";
};

/**
 * Header section of the lead card
 */
const LeadCardHeader: FC<{ lead: User; profilePictureUrl?: string }> = ({
  lead,
  profilePictureUrl,
}) => (
  <div className="flex items-start justify-between mb-8 px-8">
    <div className="flex items-start gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={profilePictureUrl} />
        <AvatarFallback className="bg-black text-white text-lg">
          {lead.name[0]}
        </AvatarFallback>
      </Avatar>
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">{lead.name}</h3>
        <Badge
          className="text-white border-grayBorders px-3 py-1 rounded-full"
          variant="outline"
          icon={<Code2 className="h-4 w-4 text-gray-400" />}
        >
          {lead.developerFields?.primaryRole || "Technical Lead"}
        </Badge>
      </div>
    </div>
  </div>
);

/**
 * Info section of the lead card
 */
const LeadCardInfo: FC<{ lead: User; joinDate: string }> = ({
  lead,
  joinDate,
}) => (
  <div className="flex items-center gap-4 mb-8 text-sm text-gray-400 px-8">
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4" />
      <span>
        {lead.leadFields?.location || lead.country || "Location not specified"}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <span>Joined: {joinDate}</span>
    </div>
    {lead.developerFields?.githubProfile && (
      <a
        href={lead.developerFields.githubProfile}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#2D7FEA] hover:underline"
      >
        {lead.developerFields.githubProfile.replace("https://", "")}
      </a>
    )}
  </div>
);

/**
 * Stats section of the lead card
 */
const LeadCardStats: FC<{
  projectCount: number;
  experience: number | null | undefined;
}> = ({ projectCount, experience }) => (
  <div className="flex justify-between items-center border-y-2 border-grayBorders px-8 py-4">
    <div className="p-4 border-r-2 border-grayBorders">
      <p className="text-2xl font-semibold text-white mb-1">{projectCount}</p>
      <p className="text-sm text-gray-400">Current Projects</p>
    </div>
    <div className="p-4 border-r-2 border-grayBorders">
      <p className="text-2xl font-semibold text-white mb-1">
        +{experience || 0}
      </p>
      <p className="text-sm text-gray-400">Years Experience</p>
    </div>
    <div className="rounded-2xl p-4">
      <p className="text-2xl font-semibold text-white mb-1">{projectCount}</p>
      <p className="text-sm text-gray-400">Development Projects</p>
    </div>
  </div>
);

/**
 * Details section of the lead card
 */
const LeadCardDetails: FC<{
  industry: string;
  skills: string;
}> = ({ industry, skills }) => (
  <div>
    <div className="flex justify-between items-center gap-3 border-b-2 border-grayBorders px-4 py-2">
      <span className="text-sm text-gray-400">Industry</span>
      <p className="text-white text-sm">{industry}</p>
    </div>
    <div className="flex justify-between items-center gap-3 px-4 py-2">
      <span className="text-sm text-gray-400">Skills</span>
      <p className="text-white text-sm">{skills}</p>
    </div>
  </div>
);

/**
 * Lead card component displaying information about a technical lead
 */
const LeadCard: FC<LeadCardProps> = ({ lead }) => {
  // Extract and prepare data
  const profilePictureUrl = getProfilePictureUrl(lead);
  const joinDate = lead.createdAt
    ? formatDate(new Date(lead.createdAt))
    : "Unknown";
  const projectCount = lead.projects?.length || 0;
  const industry = getIndustryCategories(lead);
  const skills = getSkills(lead);

  return (
    <Card className="bg-darkGray border-none rounded-2xl mb:min-w-[518px] w-full pt-8 pb-2">
      <LeadCardHeader lead={lead} profilePictureUrl={profilePictureUrl} />
      <LeadCardInfo lead={lead} joinDate={joinDate} />
      <LeadCardStats
        projectCount={projectCount}
        experience={lead.leadFields?.experience}
      />
      <LeadCardDetails industry={industry} skills={skills} />
    </Card>
  );
};

export default LeadCard;
