import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { Stack, Project } from "@/types/wizard";

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

export function ProjectLeader({ onLeaderChange, selectedLeader }: ProjectLeaderProps) {
  const [hasExistingManager, setHasExistingManager] = useState<boolean>(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchLeads() {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lead`);
        if (!response.ok) {
          throw new Error("Failed to fetch leads");
        }
        const data = await response.json();
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
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">Project leader</h2>
        <p className="text-gray-400">
          Technical Product manager is a role who will lead the whole project
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-white">Do you already have a product manager?</p>
        
        <RadioGroup
          defaultValue="new"
          onValueChange={handleManagerOptionChange}
          className="flex gap-4"
        >
          <div className={cn(
            "flex items-center space-x-2 rounded-lg border border-white/20 p-4",
            hasExistingManager && "bg-white/5"
          )}>
            <RadioGroupItem value="existing" id="existing" />
            <label htmlFor="existing" className="text-white cursor-pointer">
              Yes, I have a product manager
            </label>
          </div>

          <div className={cn(
            "flex items-center space-x-2 rounded-lg border border-white/20 p-4",
            !hasExistingManager && "bg-white/5"
          )}>
            <RadioGroupItem value="new" id="new" />
            <label htmlFor="new" className="text-white cursor-pointer">
              No, I want someone to lead the project
            </label>
          </div>
        </RadioGroup>
      </div>

      {!hasExistingManager && (
        <div className="space-y-4">
          <p className="text-white">
            These are our recommended list for the project lead role, Please Select one:
          </p>

          <div className="space-y-4">
            {isLoading ? (
              <div className="text-white">Loading leads...</div>
            ) : (
              leads?.map((lead) => (
                <div
                  key={lead.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border border-white/20 cursor-pointer hover:bg-white/5 transition-colors",
                    selectedLeader?.id === lead.id && "bg-white/5"
                  )}
                  onClick={() => handleLeaderSelect(lead)}
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${lead.name}.png`}
                        alt={lead.name}
                      />
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">{lead.name}</p>
                      <p className="text-sm text-gray-400">Technical product manager</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div>
                      <p className="text-white">+{lead.experience} years</p>
                      <p className="text-sm text-gray-400">Experience</p>
                    </div>
                    <div>
                      <p className="text-white">
                        {lead.stack.slice(0, 3).join(", ")}
                      </p>
                      <p className="text-sm text-gray-400">industry</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
} 