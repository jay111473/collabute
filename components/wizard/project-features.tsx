import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, XIcon, PencilIcon, InfoIcon, RefreshCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Feature, ProjectSide, ProjectInfo, Competitor } from "@/types/wizard";

interface ProjectFeaturesProps {
  projectInfo: ProjectInfo;
  competitors: Competitor[];
  onFeaturesChange: (features: Feature[]) => void;
  isLoading: boolean;
  suggestedFeatures: Feature[];
}

function FeatureCard({
  feature,
  isSelected,
  onToggle,
  onRemove,
}: {
  feature: Feature;
  isSelected: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`group relative p-6 rounded-xl transition-all duration-300 cursor-pointer backdrop-blur-sm inline-flex items-center shrink-0
        ${
          isSelected
            ? "bg-transparent border border-primary2/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:shadow-[0_0_20px_rgba(168,85,247,0.25)]"
            : "bg-transparent border border-white/5 hover:border-white/10"
        }
      `}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {isSelected ? (
            <div className="w-5 h-5 rounded-full bg-primary2 ring-2 ring-primary2/30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-white/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-transparent" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-medium leading-none text-white whitespace-nowrap">
                {feature.title}
              </h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="h-5 w-5 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 transition-colors cursor-help">
                      <InfoIcon className="h-3 w-3 text-white/60" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-[400px] bg-[#1A1A1A] border-white/10"
                  >
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-white/80 mb-2">
                          {feature.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-white/60">
                          <span>Timeline: {feature.estimatedTimeline}</span>
                          <span>Price: ${feature.estimatedPrice}</span>
                          <span>Complexity: {feature.complexity}</span>
                          <span>Platform: {feature.platform}</span>
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex gap-1">
              <div className="h-7 w-7 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer">
                <PencilIcon className="h-3.5 w-3.5 text-white" />
              </div>
              <div
                className="h-7 w-7 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
              >
                <XIcon className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturesByProjectSide({
  features,
  projectSides,
  selectedFeatures,
  onFeatureToggle,
  onFeatureRemove,
  onAddFeature,
  currentPhase,
}: {
  features: Feature[];
  projectSides: ProjectSide[];
  selectedFeatures: Feature[];
  onFeatureToggle: (feature: Feature) => void;
  onFeatureRemove: (feature: Feature) => void;
  onAddFeature: (projectSide: ProjectSide) => void;
  currentPhase: "alpha" | "beta" | "production";
}) {
  return (
    <div className="space-y-8">
      {projectSides.map((side) => {
        const sideFeatures = features.filter((f) => f.projectSide === side);

        return (
          <div key={side} className="space-y-4">
            <h3 className="text-lg font-medium text-white capitalize">
              {getProjectSideLabel(side)} Features
            </h3>
            <div className="flex flex-wrap gap-4">
              {sideFeatures.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  feature={feature}
                  isSelected={selectedFeatures.some(
                    (f) => f.title === feature.title
                  )}
                  onToggle={() => onFeatureToggle(feature)}
                  onRemove={() => onFeatureRemove(feature)}
                />
              ))}
              {/* Add Feature Button for each platform */}
              <div
                onClick={() => onAddFeature(side)}
                className="border-2 border-dashed border-primary2/30 hover:border-primary2/50 rounded-xl p-6 flex items-center justify-center cursor-pointer transition-all duration-300 backdrop-blur-sm group hover:shadow-[0_0_15px_rgba(168,85,247,0.1)] h-[100px] w-[200px]"
              >
                <Button
                  variant="outline"
                  className="w-full h-full flex items-center gap-2 border-0 text-primary2/70 hover:text-primary2 hover:bg-primary2/5"
                >
                  <PlusIcon className="h-4 w-4 text-gray-500" />
                  <span>Add {getProjectSideLabel(side)} Feature</span>
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ProjectFeatures({
  projectInfo,
  competitors,
  onFeaturesChange,
  isLoading,
  suggestedFeatures,
}: ProjectFeaturesProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);
  const [currentPhase, setCurrentPhase] = useState<"alpha" | "beta" | "production">("alpha");
  const [showAddFeatureDialog, setShowAddFeatureDialog] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState(false);
  
  const defaultNewFeature: Partial<Feature> = {
    title: "",
    description: "",
    estimatedTimeline: "",
    estimatedPrice: "",
    complexity: "simple",
    platform: projectInfo.projectPlatforms[0]?.value || "frontend",
    projectSide: "frontend",
    phase: "alpha",
  };
  const [newFeature, setNewFeature] = useState<Partial<Feature>>(defaultNewFeature);

  const projectSides = getProjectSides(projectInfo.projectPlatforms);

  const handleRetry = async () => {
    try {
      setIsRetrying(true);
      setError(false);
      
      const response = await fetch("/api/wizard-features-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName: projectInfo.name,
          description: projectInfo.description,
          industries: projectInfo.industries,
          competitors,
          projectPlatforms: projectInfo.projectPlatforms,
          projectScope: projectInfo.projectScope,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate features');
      }

      const data = await response.json();
      
      if (!data.features || !Array.isArray(data.features) || data.features.length === 0) {
        throw new Error('No features generated');
      }

      // Update both the parent state and local state
      onFeaturesChange(data.features);
      setSelectedFeatures([]); // Reset selected features
      setError(false);
    } catch (err) {
      console.error("Error retrying feature generation:", err);
      setError(true);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleFeatureToggle = (feature: Feature) => {
    setSelectedFeatures((prev) => {
      const isSelected = prev.some((f) => f.title === feature.title);
      if (isSelected) {
        return prev.filter((f) => f.title !== feature.title);
      }
      return [...prev, feature];
    });
    onFeaturesChange(selectedFeatures);
  };

  const handleFeatureRemove = (feature: Feature) => {
    setSelectedFeatures((prev) =>
      prev.filter((f) => f.title !== feature.title)
    );
    onFeaturesChange(selectedFeatures.filter((f) => f.title !== feature.title));
  };

  const handleAddFeature = () => {
    if (newFeature.title && newFeature.description) {
      const feature = { ...newFeature, phase: currentPhase } as Feature;
      setSelectedFeatures((prev) => [...prev, feature]);
      onFeaturesChange([...selectedFeatures, feature]);
      setShowAddFeatureDialog(false);
      setNewFeature(defaultNewFeature);
    }
  };

  const currentPhaseFeatures = suggestedFeatures.filter(
    (feature) => feature.phase === currentPhase
  );

  if (isLoading || isRetrying) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white">Project Features</h2>
          <p className="text-sm text-white/60">
            Generating features for your project...
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-[100px] w-[300px] bg-card/50 animate-pulse rounded-xl border border-border/50"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || (suggestedFeatures && suggestedFeatures.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white">Project Features</h2>
          <p className="text-sm text-white/60">
            There was an error generating features for your project.
          </p>
        </div>
        <div className="flex items-center justify-center p-8 border border-white/10 rounded-lg">
          <div className="text-center space-y-4">
            <p className="text-white/60">
              We couldn&apos;t generate features at this time. Would you like to try again?
            </p>
            <Button onClick={handleRetry} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Retry Feature Generation
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Project Features</h2>
          <Button onClick={handleRetry} variant="outline" size="sm" className="gap-2">
            <RefreshCcw className="h-3 w-3" />
            Regenerate Features
          </Button>
        </div>
        <p className="text-sm text-white/60">
          Select features for each phase of your project. Each feature represents a specific implementation task.
        </p>
      </div>

      <Tabs
        defaultValue="alpha"
        value={currentPhase}
        onValueChange={(value: string) => {
          if (value === "alpha" || value === "beta" || value === "production") {
            setCurrentPhase(value);
          }
        }}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alpha">Alpha (MVP)</TabsTrigger>
          <TabsTrigger value="beta">Beta</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
        </TabsList>

        <TabsContent value={currentPhase} className="mt-6">
          <div className="space-y-8">
            {projectSides.map((side) => {
              const sideFeatures = currentPhaseFeatures.filter(
                (f) => f.projectSide === side
              );

              return (
                <div key={side} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white capitalize">
                      {getProjectSideLabel(side)} Features
                    </h3>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        setNewFeature((prev) => ({
                          ...defaultNewFeature,
                          projectSide: side,
                          phase: currentPhase,
                        }));
                        setShowAddFeatureDialog(true);
                      }}
                    >
                      <PlusIcon className="h-4 w-4" />
                      Add {getProjectSideLabel(side)} Feature
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {sideFeatures.map((feature) => (
                      <FeatureCard
                        key={feature.title}
                        feature={feature}
                        isSelected={selectedFeatures.some(
                          (f) => f.title === feature.title
                        )}
                        onToggle={() => handleFeatureToggle(feature)}
                        onRemove={() => handleFeatureRemove(feature)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog
        open={showAddFeatureDialog}
        onOpenChange={setShowAddFeatureDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Feature</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Feature Title"
              value={newFeature.title}
              onChange={(e) =>
                setNewFeature((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <Textarea
              placeholder="Feature Description"
              value={newFeature.description}
              onChange={(e) =>
                setNewFeature((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Platform</label>
                <Select
                  value={newFeature.platform}
                  onValueChange={(value) =>
                    setNewFeature((prev) => ({ ...prev, platform: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectInfo.projectPlatforms.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Complexity</label>
                <Select
                  value={newFeature.complexity}
                  onValueChange={(value) =>
                    setNewFeature((prev) => ({
                      ...prev,
                      complexity: value as "simple" | "medium" | "complex",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Complexity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="complex">Complex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Timeline</label>
                <Input
                  placeholder="e.g., 2 weeks"
                  value={newFeature.estimatedTimeline}
                  onChange={(e) =>
                    setNewFeature((prev) => ({
                      ...prev,
                      estimatedTimeline: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Price ($)</label>
                <Input
                  placeholder="e.g., 2000"
                  value={newFeature.estimatedPrice}
                  onChange={(e) =>
                    setNewFeature((prev) => ({
                      ...prev,
                      estimatedPrice: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setShowAddFeatureDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddFeature}>Add Feature</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getProjectSides(
  projectPlatforms: { value: string; isCore?: boolean }[]
): ProjectSide[] {
  const sides = new Set<ProjectSide>();

  projectPlatforms.forEach((platform) => {
    switch (platform.value) {
      case "fullstack":
        sides.add("frontend");
        sides.add("backend");
        break;
      case "frontend":
        sides.add("frontend");
        break;
      case "backend":
        sides.add("backend");
        break;
      case "ios":
        sides.add("ios");
        sides.add("backend");
        break;
      case "android":
        sides.add("android");
        sides.add("backend");
        break;
      case "cross-platform-mobile":
        sides.add("cross-platform");
        sides.add("backend");
        break;
      case "windows":
        sides.add("windows");
        sides.add("backend");
        break;
      case "macos":
        sides.add("macos");
        sides.add("backend");
        break;
      case "cross-platform-desktop":
        sides.add("cross-platform");
        sides.add("backend");
        break;
      case "ai":
        sides.add("ai");
        sides.add("backend");
        sides.add("frontend");
        break;
      case "unknown":
        sides.add("frontend");
        sides.add("backend");
        break;
    }
  });

  return Array.from(sides);
}

function getProjectSideLabel(side: ProjectSide): string {
  switch (side) {
    case "frontend":
      return "Frontend";
    case "backend":
      return "Backend";
    case "ios":
      return "iOS";
    case "android":
      return "Android";
    case "windows":
      return "Windows";
    case "macos":
      return "macOS";
    case "cross-platform":
      return "Cross-Platform";
    case "ai":
      return "AI/ML";
    case "devops":
      return "DevOps";
    case "linux":
      return "Linux";
  }
  return "Unknown";
}
