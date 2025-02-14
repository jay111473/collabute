import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { Stack, Project } from "@/types/wizard";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  BriefcaseIcon,
  ClockIcon,
  CheckIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/lead`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch leads");
        }
        const data = await response.json();
        console.log(data);
        setLeads(data.docs);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeads();
  }, []);

  const handleManagerOptionChange = (value: string) => {
    setHasExistingManager(value === "existing");
    if (value === "existing") {
      onLeaderChange(null);
    }
  };

  const handleLeaderSelect = (leader: Lead) => {
    onLeaderChange(leader);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">
          Project Leader Selection
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
          A Technical Product Manager plays a crucial role in leading your
          project, bridging technical expertise with product vision. They ensure
          successful delivery by managing scope, timeline, and team
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
                  Find a Project Leader
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Let us match you with an experienced technical product manager
                  from our vetted community.
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
                  I Have a Manager
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  You already have a product manager who will lead this project.
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="bg-darkPrimary/10 text-darkPrimary border-darkPrimary/20"
                  >
                    {leads.length} Available
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">
                    These leaders are currently available for new projects
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary2" />
              </div>
            ) : (
              <div className="grid gap-4">
                {leads?.map((lead) => {
                  console.log(lead);
                  return (
                    <div
                      key={lead.id}
                      onClick={() => handleLeaderSelect(lead)}
                      className={cn(
                        "group relative rounded-xl border border-white/20 p-6 transition-all duration-200 hover:bg-white/5 cursor-pointer",
                        selectedLeader?.id === lead.id &&
                          "bg-white/5 border-primary2/50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 rounded-lg border-2 border-white/10">
                            <AvatarImage
                              src={`https://avatar.vercel.sh/${lead.name}.png`}
                              alt={lead.name}
                            />
                          </Avatar>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-medium text-white">
                                {lead.name}
                              </h4>
                              {selectedLeader?.id === lead.id && (
                                <CheckIcon className="h-5 w-5 text-primary2" />
                              )}
                            </div>
                            <p className="text-sm text-gray-400">
                              Technical Product Manager
                            </p>
                            <div className="flex flex-wrap gap-2 pt-2">
                              {lead.stack.slice(0, 3).map((tech, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="bg-white/5 text-xs"
                                >
                                  {typeof tech === "number" ? tech : tech.name}
                                </Badge>
                              ))}
                              {lead.stack.length > 3 && (
                                <Badge
                                  variant="outline"
                                  className="bg-white/5 text-xs"
                                >
                                  +{lead.stack.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-white">
                              {lead.experience}+ years
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BriefcaseIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-white">
                              {lead.projects?.length || 0} projects
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
