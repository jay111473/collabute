import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, X, Plus } from "lucide-react";

interface ProjectInfo {
  name: string;
  description: string;
  industries: string[];
}

interface Competitor {
  name: string;
  url: string;
}

interface ProjectCompetitorsProps {
  projectInfo: ProjectInfo;
  competitors: Competitor[];
  onCompetitorsChange: (competitors: Competitor[]) => void;
  isLoading?: boolean;
  suggestedCompetitors: Competitor[];
}

// Styles
const INPUT_BASE_STYLES = "bg-[#141414] border border-darkPrimary/40 shadow-[0_0_15px_rgba(123,97,255,0.15)] hover:shadow-[0_0_20px_rgba(123,97,255,0.25)] focus:shadow-[0_0_25px_rgba(123,97,255,0.35)] hover:border-darkPrimary/60 focus:border-darkPrimary transition-all duration-200 text-white";

// Sub-components
function CompetitorBadge({ competitor, onRemove }: { competitor: Competitor; onRemove: () => void }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "cursor-default transition-all duration-200 rounded-lg border-darkPrimary/40 shadow-[0_0_15px_rgba(123,97,255,0.15)] flex items-center gap-2",
        "bg-darkPrimary/20 text-darkPrimary border-darkPrimary shadow-[0_0_20px_rgba(123,97,255,0.25)]"
      )}
    >
      {competitor.name}
      <X
        className="h-3 w-3 hover:text-red-400 cursor-pointer transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      />
    </Badge>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center gap-2 text-primary2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">AI is analyzing your competitors...</span>
    </div>
  );
}

function ProjectSummary({ projectInfo }: { projectInfo: ProjectInfo }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm text-gray-400">Project name</h2>
        <p className="text-white">{projectInfo.name}</p>
      </div>
      <div>
        <h2 className="text-sm text-gray-400">Project description</h2>
        <p className="text-white">{projectInfo.description}</p>
      </div>
      <div>
        <h2 className="text-sm text-gray-400">Project industry</h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {projectInfo.industries.map((industry) => (
            <Badge
              key={industry}
              variant="outline"
              className="bg-darkPrimary/20 text-darkPrimary border-darkPrimary"
            >
              {industry}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProjectCompetitors({
  projectInfo,
  competitors,
  onCompetitorsChange,
  isLoading = false,
  suggestedCompetitors,
}: ProjectCompetitorsProps) {
  const [newCompetitor, setNewCompetitor] = useState({ name: "", url: "" });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleCompetitorRemove = (index: number) => {
    const newCompetitors = [...competitors];
    newCompetitors.splice(index, 1);
    onCompetitorsChange(newCompetitors);
  };

  const handleAddCompetitor = () => {
    if (newCompetitor.name && newCompetitor.url) {
      onCompetitorsChange([...competitors, newCompetitor]);
      setNewCompetitor({ name: "", url: "" });
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-8 w-1/2">
      <ProjectSummary projectInfo={projectInfo} />

      <div className="space-y-4">
        <div>
          <h2 className="text-white text-lg mb-2">
            add a few competitors you know
          </h2>
          {isLoading ? (
            <LoadingState />
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {competitors.map((competitor, index) => (
                  <CompetitorBadge
                    key={index}
                    competitor={competitor}
                    onRemove={() => handleCompetitorRemove(index)}
                  />
                ))}
              </div>

              {showAddForm ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Input
                      value={newCompetitor.url}
                      onChange={(e) => setNewCompetitor(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="Enter a competitor's website address here..."
                      className={cn(INPUT_BASE_STYLES, "placeholder:text-gray-500 rounded-lg flex-1")}
                    />
                    <Button
                      onClick={handleAddCompetitor}
                      disabled={!newCompetitor.url || !newCompetitor.name}
                      className="px-6 py-2.5 text-sm bg-primary2 hover:bg-primary2/90 text-white rounded-lg"
                    >
                      Add
                    </Button>
                  </div>
                  <Input
                    value={newCompetitor.name}
                    onChange={(e) => setNewCompetitor(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter competitor's name..."
                    className={cn(INPUT_BASE_STYLES, "placeholder:text-gray-500 rounded-lg")}
                  />
                </div>
              ) : (
                <Button
                  onClick={() => setShowAddForm(true)}
                  variant="outline"
                  className="flex items-center gap-2 text-darkPrimary hover:text-darkPrimary/90"
                >
                  <Plus className="h-4 w-4" />
                  Add competitor
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 