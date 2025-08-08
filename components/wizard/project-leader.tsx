import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Loader2,
  CheckIcon,
  MapPinIcon,
  CalendarIcon,
  GithubIcon,
  StarIcon,
  CodeIcon,
  InfoIcon,
  CheckCircleIcon,
  MailIcon,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ProjectManager {
  _id: Id<"users">;
  _creationTime: number;
  name?: string;
  email?: string;
  country?: string;
  industry?: string;
  projectManagerFields?: {
    _id: Id<"project_manager_profiles">;
    _creationTime: number;
    bio?: string;
    experience?: number;
    experienceLevel?: string;
    stack?: Array<{ name: string; level?: string }>;
    availability?: string;
    primaryRole?: string[];
    githubProfile?: string;
    preferredWorkType?: string;
    hourlyRate?: number;
    portfolio?: string[];
    resumeUrl?: string;
    managementExperience?: number;
    teamSize?: number;
    projectTypes?: string[];
    userId: Id<"users">;
  } | null;
  developerFields?: {
    _id: Id<"developer_profiles">;
    _creationTime: number;
    bio?: string;
    skills?: Array<{ skill: string; level?: string }>;
    experience?: number;
    experienceLevel?: string;
    availability?: string;
    preferredWorkType?: string;
    hourlyRate?: number;
    stripeAccountId?: string;
    stripeAccountStatus?: string;
    portfolio?: string[];
    resumeUrl?: string;
    primaryRole?: string[];
    githubProfile?: string;
    userId: Id<"users">;
  } | null;
  githubProfile?: {
    _id: Id<"github_profiles">;
    _creationTime: number;
    githubId: string;
    githubUsername: string;
    githubConnected: boolean;
    githubConnectedAt: number;
    githubAccessToken?: string;
    githubInstallationId?: string;
    githubLastFetch?: number;
    publicRepos?: number;
    followers?: number;
    following?: number;
    userId: Id<"users">;
  } | null;
  repositoriesCount?: number;
  projectsManaged?: number;
}

interface ProjectLeaderProps {
  onLeaderChange: (leader: ProjectManager | null) => void;
  selectedLeader: ProjectManager | null;
}

export function ProjectLeader({
  onLeaderChange,
  selectedLeader,
}: ProjectLeaderProps) {
  const [managerOption, setManagerOption] = useState<"find" | "invite">("find");
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [isInviting, setIsInviting] = useState<boolean>(false);
  const [invitationSent, setInvitationSent] = useState<boolean>(false);
  const [invitedEmail, setInvitedEmail] = useState<string>("");

  // Fetch project managers from Convex
  const projectManagers = useQuery(api.users.getProjectManagersWithProfiles, {
    limit: 50,
  });

  const isLoading = projectManagers === undefined;

  const handleManagerOptionChange = (value: string) => {
    setManagerOption(value as "find" | "invite");
    // Reset invitation state when switching options
    setInvitationSent(false);
    setInvitedEmail("");
    setInviteEmail("");
    // Clear selected leader to reset the state
    onLeaderChange(null);
  };

  // Invite project manager mutation
  const inviteProjectManager = useMutation(
    api.invitations.sendProjectManagerInvitation
  );

  const handleInviteProjectManager = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsInviting(true);
    try {
      await inviteProjectManager({
        email: inviteEmail.trim(),
        projectName: "your project", // TODO: Get actual project name
        inviterName: "Project Owner", // TODO: Get actual user name
      });
      toast.success(`Invitation sent to ${inviteEmail}!`);
      setInvitedEmail(inviteEmail.trim());
      setInvitationSent(true);
      setInviteEmail("");
      // Create a pseudo project manager object to enable next button
      onLeaderChange({
        _id: "invited" as Id<"users">,
        _creationTime: Date.now(),
        email: inviteEmail.trim(),
        name: "Invited Project Manager",
      } as ProjectManager);
    } catch (error: any) {
      toast.error(
        error.message || "Failed to send invitation. Please try again."
      );
    } finally {
      setIsInviting(false);
    }
  };

  const handleLeaderSelect = (leader: ProjectManager) => {
    onLeaderChange(leader);
  };

  const formatJoinedDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const getSkillsText = (projectManager: ProjectManager) => {
    // Try to get skills from projectManagerFields stack first
    if (projectManager.projectManagerFields?.stack) {
      return projectManager.projectManagerFields.stack
        .map((tech) => tech.name)
        .slice(0, 5)
        .join(", ");
    }
    // Fallback to developerFields skills
    if (projectManager.developerFields?.skills) {
      return projectManager.developerFields.skills
        .map((skill) => skill.skill)
        .slice(0, 5)
        .join(", ");
    }
    return "JavaScript, TypeScript, React, Node.js";
  };

  const getExperience = (projectManager: ProjectManager) => {
    return (
      projectManager.projectManagerFields?.experience ||
      projectManager.developerFields?.experience ||
      3
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-white">
              Project Leader Selection
            </h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-5 w-5 text-gray-400 hover:text-white transition-colors cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm bg-zinc-900 border-zinc-700 text-white">
                <p className="text-sm leading-relaxed">
                  A Technical Product Manager coordinates between technical
                  teams and business goals, manages project timelines, ensures
                  quality delivery, handles stakeholder communication, and makes
                  critical technical decisions to keep your project on track.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
            A Technical Product Manager plays a crucial role in leading your
            project, bridging technical expertise with product vision. They
            ensure successful delivery by managing scope, timeline, and team
            coordination.
          </p>
        </div>

        <div className="space-y-6">
          <RadioGroup
            value={managerOption}
            onValueChange={handleManagerOptionChange}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <label
              htmlFor="find"
              className={cn(
                "relative flex flex-col space-y-2 rounded-xl border border-white/20 p-6 transition-all duration-200 cursor-pointer",
                managerOption === "find" && "bg-white/5 border-primary2/50"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-5 w-5 items-center justify-center shrink-0">
                  <RadioGroupItem
                    value="find"
                    id="find"
                    className="h-4 w-4 border-2 border-white/60 text-primary2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-lg font-medium text-white">
                    Find a Technical Product Manager
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    We&apos;ll match you with an experienced technical product
                    manager from our vetted community.
                  </p>
                </div>
              </div>
            </label>

            <label
              htmlFor="invite"
              className={cn(
                "relative flex flex-col space-y-2 rounded-xl border border-white/20 p-6 transition-all duration-200 cursor-pointer",
                managerOption === "invite" && "bg-white/5 border-primary2/50"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-5 w-5 items-center justify-center shrink-0">
                  <RadioGroupItem
                    value="invite"
                    id="invite"
                    className="h-4 w-4 border-2 border-white/60 text-primary2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-lg font-medium text-white">
                    Invite Your Own Project Manager
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Invite someone you know to be the technical product manager
                    for this project.
                  </p>
                </div>
              </div>
            </label>
          </RadioGroup>

          {/* Invite Email Input or Success State */}
          {managerOption === "invite" && (
            <div className="space-y-4 bg-white/5 border border-white/10 rounded-xl p-6">
              {!invitationSent ? (
                <div className="space-y-2">
                  <label
                    htmlFor="invite-email"
                    className="text-sm font-medium text-white"
                  >
                    Email Address
                  </label>
                  <div className="flex gap-3">
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="Enter their email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1 bg-darkGray border-grayBorders text-white placeholder-gray-400"
                    />
                    <Button
                      onClick={handleInviteProjectManager}
                      disabled={isInviting || !inviteEmail.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                    >
                      {isInviting ? "Sending..." : "Send Invite"}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400">
                    We&apos;ll send them an invitation email to join as your
                    project manager.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center space-y-4 py-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full">
                    <CheckCircleIcon className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">
                      Invitation Sent Successfully!
                    </h3>
                    <p className="text-gray-400 max-w-md">
                      We&apos;ve sent an invitation to{" "}
                      <span className="text-white font-medium">
                        {invitedEmail}
                      </span>{" "}
                      to join as your Technical Product Manager.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg text-sm">
                    <MailIcon className="h-4 w-4" />
                    <span>They will receive an email with next steps</span>
                  </div>
                  <div className="pt-2">
                    <Button
                      onClick={() => {
                        setInvitationSent(false);
                        setInvitedEmail("");
                        onLeaderChange(null);
                      }}
                      variant="outline"
                      size="sm"
                      className="text-white border-white/20 hover:bg-white/10"
                    >
                      Send Another Invitation
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {managerOption === "find" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">
                Available Project Managers
              </h3>
              <Badge
                variant="outline"
                className="bg-darkPrimary/10 text-darkPrimary border-darkPrimary/20"
              >
                {projectManagers?.length || 0} Available
              </Badge>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-darkPrimary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {projectManagers?.map((projectManager) => (
                    <div
                      key={projectManager._id}
                      onClick={() => handleLeaderSelect(projectManager)}
                      className={cn(
                        "group relative p-8 rounded-2xl transition-all duration-300 cursor-pointer",
                        "bg-[#1a1a1a] border border-zinc-800 hover:border-darkPrimary/50 hover:shadow-[0_0_30px_rgba(123,97,255,0.15)]",
                        selectedLeader?._id === projectManager._id &&
                          "border-darkPrimary/50 bg-white/5 shadow-[0_0_30px_rgba(123,97,255,0.15)]"
                      )}
                    >
                      {/* Header Section */}
                      <div className="flex items-start gap-6 mb-8">
                        <Avatar className="h-20 w-20 rounded-full border-4 border-white/10">
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${projectManager.name || projectManager.email}.png`}
                            alt={projectManager.name || "Project Manager"}
                            className="rounded-full"
                          />
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-2xl font-semibold text-white truncate">
                              {projectManager.name || "Project Manager"}
                            </h4>
                            {selectedLeader?._id === projectManager._id && (
                              <CheckIcon className="h-5 w-5 text-darkPrimary shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-1.5 rounded-full">
                              <CodeIcon className="h-4 w-4 text-white/60" />
                              <span className="text-sm text-white/80">
                                Technical product manager
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Info Row */}
                      <div className="flex items-center gap-8 mb-8 text-sm text-white/60">
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="h-4 w-4" />
                          <span>
                            {projectManager.country || "United States"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          <span>
                            Joined:{" "}
                            {formatJoinedDate(projectManager._creationTime)}
                          </span>
                        </div>
                        {projectManager.githubProfile?.githubUsername && (
                          <div className="flex items-center gap-2">
                            <GithubIcon className="h-4 w-4" />
                            <span>
                              github.com/
                              {projectManager.githubProfile.githubUsername}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Stats Section */}
                      <div className="grid grid-cols-3 gap-8 mb-8">
                        <div>
                          <div className="text-3xl font-bold text-white mb-1">
                            {projectManager.projectsManaged || 0}
                          </div>
                          <div className="text-sm text-white/60">
                            Projects Managed
                          </div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-white mb-1">
                            +{getExperience(projectManager)}
                          </div>
                          <div className="text-sm text-white/60">
                            Years Experience
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <StarIcon className="h-6 w-6 text-purple-400 fill-current" />
                            <span className="text-3xl font-bold text-purple-400">
                              4.9
                            </span>
                          </div>
                          <div className="text-sm text-white/60">Rating</div>
                        </div>
                      </div>

                      {/* Details Section */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">Industry</span>
                          <span className="text-white text-right">
                            {projectManager.industry || "Technology"}
                          </span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-white/60 shrink-0 mr-4">
                            Skills
                          </span>
                          <span className="text-white text-right">
                            {getSkillsText(projectManager)}
                          </span>
                        </div>
                      </div>

                      {/* Availability Badge */}
                      {projectManager.projectManagerFields?.availability ===
                        "available" && (
                        <div className="absolute top-6 right-6">
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs"
                          >
                            Available
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
