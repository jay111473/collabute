import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { Stack, Project } from "@/types/wizard";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import axios from "axios";

interface Lead {
  id: number;
  name: string;
  experience: number;
  stack: (number | Stack)[];
  projects?: (number | Project)[] | null;
  availability?: boolean | null;
  updatedAt: string;
  createdAt: string;
}

interface ProjectLeaderProps {
  onLeaderChange: (leader: Lead | null) => void;
  selectedLeader: Lead | null;
}

export function ProjectLeader({
  onLeaderChange,
  selectedLeader,
}: ProjectLeaderProps) {
  const [hasExistingManager, setHasExistingManager] = useState<boolean>(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchLeads() {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/lead?depth=2`
        );
        if (response.status !== 200) {
          throw new Error("Failed to fetch leads");
        }
        const data = response.data;
        console.log(data);
        setLeads(data.docs);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeads();
  }, [hasExistingManager]);

  const handleManagerOptionChange = (value: string) => {
    setHasExistingManager(value === "existing");
    if (value === "existing") {
      onLeaderChange(null);
    }
  };

  const handleLeaderSelect = (leader: Lead) => {
    onLeaderChange(leader);
  };

  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const getSkillsText = (stack: (number | Stack)[]) => {
    return stack
      .map((tech) => (typeof tech === "number" ? tech.toString() : tech.name))
      .join(", ");
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
            value={hasExistingManager ? "existing" : "new"}
            onValueChange={handleManagerOptionChange}
            className="grid grid-cols-2 gap-4"
          >
            <label
              htmlFor="new"
              className={cn(
                "relative flex flex-col space-y-2 rounded-xl border border-white/20 p-6 transition-all duration-200 cursor-pointer",
                !hasExistingManager && "bg-white/5 border-primary2/50"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-5 w-5 items-center justify-center shrink-0">
                  <RadioGroupItem
                    value="new"
                    id="new"
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
              htmlFor="existing"
              className={cn(
                "relative flex flex-col space-y-2 rounded-xl border border-white/20 p-6 transition-all duration-200 cursor-pointer",
                hasExistingManager && "bg-white/5 border-primary2/50"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-5 w-5 items-center justify-center shrink-0">
                  <RadioGroupItem
                    value="existing"
                    id="existing"
                    className="h-4 w-4 border-2 border-white/60 text-primary2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-lg font-medium text-white">
                    Have a Technical Product Manager
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    You already have a technical product manager who will lead
                    this project.
                  </p>
                </div>
              </div>
            </label>
          </RadioGroup>
        </div>

        {!hasExistingManager && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">
                Available Project Leaders
              </h3>
              <Badge
                variant="outline"
                className="bg-darkPrimary/10 text-darkPrimary border-darkPrimary/20"
              >
                {leads.length} Available
              </Badge>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-darkPrimary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {leads?.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => handleLeaderSelect(lead)}
                      className={cn(
                        "group relative p-8 rounded-2xl transition-all duration-300 cursor-pointer",
                        "bg-[#1a1a1a] border border-zinc-800 hover:border-darkPrimary/50 hover:shadow-[0_0_30px_rgba(123,97,255,0.15)]",
                        selectedLeader?.id === lead.id &&
                          "border-darkPrimary/50 bg-white/5 shadow-[0_0_30px_rgba(123,97,255,0.15)]"
                      )}
                    >
                      {/* Header Section */}
                      <div className="flex items-start gap-6 mb-8">
                        <Avatar className="h-20 w-20 rounded-full border-4 border-white/10">
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${lead.name}.png`}
                            alt={lead.name}
                            className="rounded-full"
                          />
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-2xl font-semibold text-white truncate">
                              {lead.name}
                            </h4>
                            {selectedLeader?.id === lead.id && (
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
                          <span>United States</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          <span>
                            Joined: {formatJoinedDate(lead.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GithubIcon className="h-4 w-4" />
                          <span>
                            Github.com/@
                            {lead.name.toLowerCase().replace(" ", "_")}
                          </span>
                        </div>
                      </div>

                      {/* Stats Section */}
                      <div className="grid grid-cols-3 gap-8 mb-8">
                        <div>
                          <div className="text-3xl font-bold text-white mb-1">
                            {lead.projects?.length || 0}
                          </div>
                          <div className="text-sm text-white/60">
                            Current Projects
                          </div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-white mb-1">
                            +{lead.experience}
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
                            Web3, Crypto, Finance
                          </span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-white/60 shrink-0 mr-4">
                            Skills
                          </span>
                          <span className="text-white text-right">
                            {getSkillsText(lead.stack)}
                          </span>
                        </div>
                      </div>

                      {/* Availability Badge */}
                      {lead.availability && (
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
