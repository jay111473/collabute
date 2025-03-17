import React from "react";
import { cookies } from "next/headers";
import { getUser } from "@/lib/get-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Media, User } from "@/types/dashboard";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Github,
  Pencil,
  Eye,
  Link as LinkIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { GitHubActivitySection } from "@/components/github";

/**
 * Profile page for developers
 * Displays developer information from the User type
 */
async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  try {
    const data = await getUser(token || "");
    const user = data?.user;
    if (user.type !== "developer") {
      return <NonDeveloperMessage />;
    }

    return <DeveloperProfile user={user} token={token} />;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return <ErrorMessage />;
  }
}

/**
 * Message displayed when there's an error fetching the profile
 */
function ErrorMessage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-white">
        There was an error loading your profile. Please try again later.
      </p>
    </div>
  );
}

/**
 * Message displayed when a non-developer tries to access the developer profile
 */
function NonDeveloperMessage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-white">
        This profile page is only for developer accounts
      </p>
    </div>
  );
}

// Types
type DeveloperProfileProps = {
  user: User;
  token: string;
};

type ProfileHeaderProps = {
  name: string;
  username: string;
  profilePictureUrl?: string;
  primaryRole?: string | null;
};

type ProfileInfoProps = {
  country?: string | null;
  joinedDate: string;
  githubProfile?: string | null;
  personalWebsite?: string | null;
};

type ProfileStatsProps = {
  projectsCount: number;
  issuesApplied: number;
  issuesDone: number;
};

type SkillItemType = {
  id?: string | null;
  skill?: string | null;
};

type SkillSetProps = {
  skills?: SkillItemType[] | null;
};

type AchievementsProps = {
  experienceLevel?: string | null;
  hourlyRate?: number | null;
};

// Utility functions
/**
 * Format date to display in a readable format
 */
function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return "N/A";

  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (error) {
    return "Invalid date";
  }
}

/**
 * Extract username from email or GitHub profile
 */
function getUsername(user: User): string {
  if (user.developerFields?.githubProfile) {
    const githubUrl = user.developerFields.githubProfile;
    const githubUsername = githubUrl.split("/").pop();
    return githubUsername || user.email.split("@")[0];
  }

  return user.email.split("@")[0];
}

/**
 * Format joined date from timestamp
 */
function formatJoinedDate(dateString: string | undefined | null): string {
  if (!dateString) return "May 2024"; // Fallback

  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    return "May 2024"; // Fallback
  }
}

/**
 * Extract profile picture URL from user object
 */
function getProfilePictureUrl(profilePicture: any): string {
  if (
    profilePicture &&
    typeof profilePicture === "object" &&
    profilePicture.url
  ) {
    return profilePicture.url;
  }
  return "";
}

/**
 * Count resolved issues
 */
function countResolvedIssues(issues: any[] | null | undefined): number {
  if (!issues) return 0;

  return issues.filter(
    (issue) => typeof issue === "object" && issue.status === "resolved"
  ).length;
}

// Components
/**
 * Profile header with user info and action buttons
 */
function ProfileHeader({
  name,
  username,
  profilePictureUrl,
  primaryRole,
}: ProfileHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Avatar className="h-24 w-24 rounded-full">
          <AvatarImage
            src={profilePictureUrl || ""}
            alt={`${name}'s profile picture`}
          />
          <AvatarFallback className="bg-amber-200 text-black text-3xl">
            {name[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold text-white">{name}</h1>
          <p className="text-gray-400">@{username}</p>
          <Badge className="mt-2 bg-[#1e2736] text-white border-none px-4 py-1.5 rounded-full">
            <span className="flex items-center gap-2">
              Developer {primaryRole ? `( ${primaryRole} )` : ""}
            </span>
          </Badge>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex items-center gap-2 rounded-lg border-gray-700 bg-transparent hover:bg-gray-800"
        >
          <Pencil size={18} />
          Edit Profile
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2 rounded-lg border-gray-700 bg-transparent hover:bg-gray-800"
        >
          <Eye size={18} />
          View public profile
        </Button>
      </div>
    </div>
  );
}

/**
 * User info section with location, joined date, and links
 */
function ProfileInfo({
  country,
  joinedDate,
  githubProfile,
  personalWebsite,
}: ProfileInfoProps) {
  return (
    <div className="flex flex-wrap gap-6 text-gray-400">
      {country && (
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-gray-500" />
          {country}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Calendar size={18} className="text-gray-500" />
        Joined: {joinedDate}
      </div>

      {githubProfile && (
        <div className="flex items-center gap-2">
          <Github size={18} className="text-gray-500" />
          {githubProfile}
        </div>
      )}

      {personalWebsite && (
        <div className="flex items-center gap-2">
          <LinkIcon size={18} className="text-gray-500" />
          {personalWebsite}
        </div>
      )}
    </div>
  );
}

/**
 * Stats section showing projects and issues counts
 */
function ProfileStats({
  projectsCount,
  issuesApplied,
  issuesDone,
}: ProfileStatsProps) {
  return (
    <div className="flex border-y border-gray-800 py-6">
      <div className="flex-1 text-center border-r border-gray-800">
        <div className="text-3xl font-bold text-white">{projectsCount}</div>
        <div className="text-gray-400 text-sm">Projects involved</div>
      </div>
      <div className="flex-1 text-center border-r border-gray-800">
        <div className="text-3xl font-bold text-white">{issuesApplied}</div>
        <div className="text-gray-400 text-sm">Issues applied</div>
      </div>
      <div className="flex-1 text-center">
        <div className="text-3xl font-bold text-white">{issuesDone}</div>
        <div className="text-gray-400 text-sm">Issues done</div>
      </div>
    </div>
  );
}

/**
 * Skill set section showing developer skills
 */
function SkillSet({ skills }: SkillSetProps) {
  const defaultSkills = [
    { id: "1", skill: "React/React js" },
    { id: "2", skill: "Next js" },
    { id: "3", skill: "HTML/Css" },
  ];

  const skillsToShow = skills && skills.length > 0 ? skills : defaultSkills;

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Skill set</h2>
      <div className="flex flex-wrap gap-3">
        {skillsToShow.map((skillItem, index) => (
          <Badge
            key={skillItem.id || index}
            className="bg-[#1e2736] hover:bg-[#2a3749] text-white border-none px-4 py-2 rounded-full text-sm"
          >
            {skillItem.skill}
          </Badge>
        ))}
      </div>
    </div>
  );
}

/**
 * Achievements section showing badges based on experience and rate
 */
function Achievements({ experienceLevel, hourlyRate }: AchievementsProps) {
  const isPro =
    experienceLevel === "senior" ||
    experienceLevel === "lead" ||
    experienceLevel === "architect";

  const isPremium = hourlyRate && hourlyRate > 50;

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Achievements</h2>
      <div className="flex flex-wrap gap-3">
        <Badge className="bg-[#1e2736] hover:bg-[#2a3749] text-white border-none px-5 py-3 rounded-full flex items-center gap-2 text-sm">
          <span className="text-yellow-500 text-xl">🏆</span>
          {isPro ? "Pro developer" : "Developer"}
        </Badge>

        {isPremium && (
          <Badge className="bg-[#1e2736] hover:bg-[#2a3749] text-white border-none px-5 py-3 rounded-full flex items-center gap-2 text-sm">
            <span className="text-green-500 text-xl">💰</span> Premium Rate
          </Badge>
        )}
      </div>
    </div>
  );
}

/**
 * Main developer profile component
 */
function DeveloperProfile({ user, token }: DeveloperProfileProps) {
  const developerFields = user.developerFields || {};
  const username = getUsername(user);

  // Prepare data for components
  const projectsCount = user.projects?.length || 0;
  const issuesApplied = developerFields.issues?.length || 0;
  const issuesDone = countResolvedIssues(developerFields.issues);
  const joinedDate = formatJoinedDate(developerFields.dateJoined);
  const profilePictureUrl = getProfilePictureUrl(
    (user.profilePicture as Media)?.url
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col space-y-8">
        <ProfileHeader
          name={user.name}
          username={username}
          profilePictureUrl={profilePictureUrl}
          primaryRole={developerFields.primaryRole}
        />

        <ProfileInfo
          country={user.country}
          joinedDate={joinedDate}
          githubProfile={developerFields.githubProfile}
          personalWebsite={developerFields.personalWebsite}
        />

        <ProfileStats
          projectsCount={projectsCount}
          issuesApplied={issuesApplied}
          issuesDone={issuesDone}
        />

        <SkillSet skills={developerFields.skills} />

        <Achievements
          experienceLevel={developerFields.experienceLevel}
          hourlyRate={developerFields.hourlyRate}
        />
        
        {/* GitHub Activity Section */}
          <GitHubActivitySection token={token} userId={user.id?.toString()} />
      </div>
    </div>
  );
}

export default ProfilePage;
