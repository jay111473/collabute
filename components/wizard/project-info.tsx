import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Loader2, X, HelpCircle, CheckIcon, InfoIcon } from "lucide-react";
import {
  Industry,
  ProjectScope,
  ProjectPlatform,
  PROJECT_PLATFORMS,
} from "@/types/wizard";
import { ALL_INDUSTRIES } from "@/utils/industries";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProjectType } from "@/types/dashboard";

// Types
interface ProjectInfoProps {
  onProjectInfoChange: (info: ProjectInfo) => void;
  isLoading?: boolean;
  suggestedIndustries: Industry[];
}

interface ProjectInfo {
  name: string;
  description: string;
  industries: string[];
  projectScope: ProjectScope;
  projectPlatforms: { value: string; isCore?: boolean }[];
}

interface IndustryBadgeProps {
  industry: Industry;
  isSelected: boolean;
  onRemove: () => void;
}

// Styles
const INPUT_BASE_STYLES =
  "bg-[#141414] border border-darkPrimary/40 shadow-[0_0_15px_rgba(123,97,255,0.15)] hover:shadow-[0_0_20px_rgba(123,97,255,0.25)] focus:shadow-[0_0_25px_rgba(123,97,255,0.35)] hover:border-darkPrimary/60 focus:border-darkPrimary transition-all duration-200 text-white";

// Sub-components
function IndustryBadge({ industry, isSelected, onRemove }: IndustryBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "cursor-default transition-all duration-200 rounded-lg border-darkPrimary/40 shadow-[0_0_15px_rgba(123,97,255,0.15)] flex items-center gap-2",
        isSelected
          ? "bg-darkPrimary/20 text-darkPrimary border-darkPrimary shadow-[0_0_20px_rgba(123,97,255,0.25)]"
          : "text-darkPrimary hover:bg-darkPrimary/10 hover:border-darkPrimary hover:shadow-[0_0_20px_rgba(123,97,255,0.25)]"
      )}
    >
      {industry.label}
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
      <span className="text-sm">AI is analyzing your project...</span>
    </div>
  );
}

function IndustrySelector({
  selectedIndustries,
  onIndustryAdd,
  hasReachedLimit,
}: {
  selectedIndustries: string[];
  onIndustryAdd: (value: string) => void;
  hasReachedLimit: boolean;
}) {
  const availableIndustries = ALL_INDUSTRIES.filter(
    (industry) => !selectedIndustries.includes(industry.value)
  );

  return (
    <div>
      <h3 className="text-sm text-gray-400 mb-2">Add more industries</h3>
      <Select onValueChange={onIndustryAdd} disabled={hasReachedLimit}>
        <SelectTrigger
          className={cn(
            INPUT_BASE_STYLES,
            "w-[300px]",
            hasReachedLimit && "opacity-50 cursor-not-allowed"
          )}
        >
          <SelectValue
            placeholder={
              hasReachedLimit ? "Maximum industries reached" : "Add industry"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {availableIndustries.map((industry) => (
            <SelectItem key={industry.value} value={industry.value}>
              {industry.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasReachedLimit && (
        <p className="text-yellow-500 text-sm mt-2">
          You&apos;ve reached the maximum limit of 5 industries
        </p>
      )}
    </div>
  );
}

function ProjectPlatformSelect({
  values,
  onValuesChange,
  scope,
  projectDescription,
}: {
  values: { value: string; isCore?: boolean }[];
  onValuesChange: (values: { value: string; isCore?: boolean }[]) => void;
  scope: ProjectScope;
  projectDescription: string;
}) {
  const [suggestedPlatforms, setSuggestedPlatforms] = useState<ProjectPlatform[]>([]);

  useEffect(() => {
    if (scope === "unknown" && projectDescription) {
      // Find suggested platforms based on project description keywords
      const suggestions = PROJECT_PLATFORMS.filter((platform) =>
        platform.suggestedFor?.some((keyword) =>
          projectDescription.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      // Add core platforms first
      const corePlatforms = suggestions.filter((p) => p.isCore);
      const optionalPlatforms = suggestions.filter((p) => !p.isCore);

      setSuggestedPlatforms([...corePlatforms, ...optionalPlatforms]);

      // Automatically select core platforms
      if (values.length === 0) {
        onValuesChange(
          corePlatforms.map((p) => ({ value: p.value, isCore: true }))
        );
      }
    }
  }, [scope, projectDescription, values.length, onValuesChange]);

  const availablePlatforms =
    scope === "unknown"
      ? suggestedPlatforms
      : PROJECT_PLATFORMS.filter((platform) => platform.scopes.includes(scope));

  const groupedPlatforms = availablePlatforms.reduce((acc, platform) => {
    const category = platform.category || "unknown";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(platform);
    return acc;
  }, {} as Record<string, ProjectPlatform[]>);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "web":
        return "Web Applications";
      case "mobile":
        return "Mobile Applications";
      case "desktop":
        return "Desktop Applications";
      case "ai":
        return "AI/ML Applications";
      default:
        return "Other";
    }
  };

  const handleValueChange = (platformValue: string) => {
    const platform = PROJECT_PLATFORMS.find((p) => p.value === platformValue);
    if (!platform) return;

    const isSelected = values.some((v) => v.value === platformValue);
    let newValues;

    if (isSelected) {
      // Don't allow removing core platforms in 'unknown' scope
      if (
        scope === "unknown" &&
        values.find((v) => v.value === platformValue)?.isCore
      ) {
        return;
      }
      newValues = values.filter((v) => v.value !== platformValue);
    } else {
      newValues = [
        ...values,
        {
          value: platformValue,
          isCore: scope === "unknown" && platform.isCore,
        },
      ];
    }

    onValuesChange(newValues);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm text-gray-400">Project platforms</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px] p-4 bg-[#1A1A1A] border-white/10">
              <p className="text-sm text-white/80">
                {scope === "unknown"
                  ? "Based on your project description, we've suggested the platforms you'll need. Core platforms can't be removed as they're essential for your project."
                  : "Select the platforms you want to include in your project."}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {scope !== "unknown" && (
        <div className="space-y-4 rounded-lg border border-zinc-800 bg-black/50 p-4">
          {Object.entries(groupedPlatforms).map(([category, platforms], index, array) => (
            <div key={category}>
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-400">
                  {getCategoryLabel(category)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {platforms.map((platform) => {
                    const isSelected = values.some((v) => v.value === platform.value);
                    const isCore = platform.isCore;
                    
                    return (
                      <div
                        key={platform.value}
                        className={cn(
                          "group relative flex items-start gap-3 rounded-lg p-3 cursor-pointer transition-all",
                          isSelected
                            ? "bg-darkPrimary/10 hover:bg-darkPrimary/20"
                            : "hover:bg-zinc-800/50"
                        )}
                        onClick={() => handleValueChange(platform.value)}
                      >
                        <div className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors mt-1",
                          isSelected
                            ? "border-darkPrimary bg-darkPrimary"
                            : "border-zinc-700 group-hover:border-zinc-500"
                        )}>
                          {isSelected && <CheckIcon className="h-3 w-3 text-black" />}
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white">{platform.label}</span>
                            {isCore && (
                              <Badge
                                variant="outline"
                                className="text-[10px] h-4 bg-darkPrimary/10 border-darkPrimary/20 text-darkPrimary"
                              >
                                Core
                              </Badge>
                            )}
                          </div>
                          {platform.description && (
                            <p className="text-xs text-gray-400 line-clamp-2">
                              {platform.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {index < array.length - 1 && (
                <div className="h-px bg-zinc-800 my-4" />
              )}
            </div>
          ))}
        </div>
      )}

      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {values.map(({ value, isCore }) => {
            const platform = PROJECT_PLATFORMS.find((p) => p.value === value)!;
            return (
              <div
                key={value}
                className={cn(
                  "group relative flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors",
                  isCore
                    ? "bg-darkPrimary/20"
                    : "bg-darkPrimary/10 hover:bg-darkPrimary/20"
                )}
              >
                <span className="text-sm text-white">{platform.label}</span>
                {isCore && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-darkPrimary/20 border-darkPrimary"
                  >
                    Core
                  </Badge>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 text-white/60 hover:text-white/80 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-[300px] p-4 bg-[#1A1A1A] border-white/10"
                    >
                      <p className="text-sm text-white/80 whitespace-pre-line">
                        {platform.description}
                        {isCore &&
                          "\n\nThis is a core platform required for your project type."}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {!isCore && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleValueChange(value);
                    }}
                    className="text-white/60 hover:text-white/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {scope === "unknown" && suggestedPlatforms.length > 0 && (
        <p className="text-sm text-gray-500">
          Based on your project description, we&apos;ve suggested the platforms
          you&apos;ll need. Core platforms are essential and can&apos;t be removed.
        </p>
      )}
    </div>
  );
}

// Main component
export function ProjectInfo({
  onProjectInfoChange,
  isLoading = false,
  suggestedIndustries,
}: ProjectInfoProps) {
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    name: "",
    description: "",
    industries: [],
    projectScope: "unknown",
    projectPlatforms: [],
  });
  const [hasInteractedWithIndustries, setHasInteractedWithIndustries] =
    useState(false);

  useEffect(() => {
    if (suggestedIndustries.length > 0) {
      const industryValues = suggestedIndustries
        .slice(0, 5)
        .map((industry) => industry.value);
      updateProjectInfo({ industries: industryValues });
    }
  }, [suggestedIndustries]);

  const updateProjectInfo = (updates: Partial<ProjectInfo>) => {
    const newInfo = { ...projectInfo, ...updates };
    setProjectInfo(newInfo);
    onProjectInfoChange(newInfo);
  };

  const handleInputChange = (
    value: string,
    field: keyof Pick<ProjectInfo, "name" | "description">
  ) => {
    updateProjectInfo({ [field]: value });
  };

  const handleIndustryRemove = (industryValue: string) => {
    setHasInteractedWithIndustries(true);
    const newIndustries = projectInfo.industries.filter(
      (i) => i !== industryValue
    );
    updateProjectInfo({ industries: newIndustries });
  };

  const handleIndustryAdd = (value: string) => {
    setHasInteractedWithIndustries(true);
    if (
      !projectInfo.industries.includes(value) &&
      projectInfo.industries.length < 5
    ) {
      updateProjectInfo({ industries: [...projectInfo.industries, value] });
    }
  };

  const hasReachedLimit = projectInfo.industries.length >= 5;
  const showValidationMessage =
    hasInteractedWithIndustries && projectInfo.industries.length === 0;

  return (
    <div className="space-y-6 w-1/2">
      <div className="space-y-2">
        <h2 className="text-sm text-gray-400">Project name</h2>
        <Input
          value={projectInfo.name}
          onChange={(e) => handleInputChange(e.target.value, "name")}
          placeholder="Enter your project name (it's editable later) ..."
          className={cn(
            INPUT_BASE_STYLES,
            "placeholder:text-gray-500 rounded-lg"
          )}
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-sm text-gray-400">Project scope</h2>
        <Select
          value={projectInfo.projectScope}
          onValueChange={(value: ProjectScope) => {
            updateProjectInfo({
              projectScope: value,
              projectPlatforms: [], // Reset project platforms when scope changes
            });
          }}
        >
          <SelectTrigger className={cn(INPUT_BASE_STYLES, "w-full")}>
            <SelectValue placeholder="Select project scope" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">
              New Project (Build from scratch)
            </SelectItem>
            <SelectItem value="partial">
              Already have a project (Add a new feature)
            </SelectItem>
            <SelectItem value="unknown">I&apos;m not sure yet</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500 mt-1">
          {projectInfo.projectScope === "full" &&
            "We'll help you plan and build a complete solution from start to finish."}
          {projectInfo.projectScope === "partial" &&
            "We'll focus on building a specific part of your project."}
          {projectInfo.projectScope === "unknown" &&
            "Don't worry if you're not sure. We'll help you figure out what you need based on your requirements."}
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm text-gray-400">Project description</h2>
        <Textarea
          value={projectInfo.description}
          onChange={(e) => handleInputChange(e.target.value, "description")}
          placeholder="Describe your project ..."
          className={cn(
            INPUT_BASE_STYLES,
            "placeholder:text-gray-500 min-h-[100px] rounded-lg focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
          )}
        />
      </div>

      {projectInfo.projectScope !== "unknown" && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <ProjectPlatformSelect
            values={projectInfo.projectPlatforms}
            onValuesChange={(values) =>
              updateProjectInfo({ projectPlatforms: values })
            }
            scope={projectInfo.projectScope}
            projectDescription={projectInfo.description}
          />
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <LoadingState />
        ) : suggestedIndustries.length > 0 ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-white text-lg mb-2">
                Suggested industries for your project
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                We&apos;ve analyzed your project and suggested these industries.
                You can remove any of them or add more from the selection below.{" "}
                <span className="text-darkPrimary">
                  ({projectInfo.industries.length}/5 selected)
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  ...suggestedIndustries,
                  ...ALL_INDUSTRIES.filter(
                    (ind) =>
                      projectInfo.industries.includes(ind.value) &&
                      !suggestedIndustries.some((s) => s.value === ind.value)
                  ),
                ]
                  .filter((industry) =>
                    projectInfo.industries.includes(industry.value)
                  )
                  .map((industry) => (
                    <IndustryBadge
                      key={industry.value}
                      industry={industry}
                      isSelected={true}
                      onRemove={() => handleIndustryRemove(industry.value)}
                    />
                  ))}
              </div>
              {showValidationMessage && (
                <p className="text-red-400 text-sm mt-2">
                  Please select at least one industry for your project
                </p>
              )}
            </div>

            <IndustrySelector
              selectedIndustries={projectInfo.industries}
              onIndustryAdd={handleIndustryAdd}
              hasReachedLimit={hasReachedLimit}
            />
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            We will analyze your project and suggest industries for you
          </p>
        )}
      </div>
    </div>
  );
}
