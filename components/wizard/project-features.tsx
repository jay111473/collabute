import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, XIcon, PencilIcon, InfoIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { ProjectSide, Feature } from "@/types/wizard";

interface ProjectFeaturesProps {
  projectInfo: {
    name: string;
    description: string;
    industries: string[];
    projectPlatforms: { value: string; isCore?: boolean }[];
    projectScope: string;
  };
  competitors: Array<{ name: string; url: string }>;
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
                    className="max-w-[300px] bg-[#1A1A1A] border-white/10"
                  >
                    <div className="space-y-2">
                      <p className="text-sm text-white/80">
                        {feature.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-white/60">
                        <span>Timeline: {feature.estimatedTimeline}</span>
                        <span>Price: ${feature.estimatedPrice}</span>
                        <span>Complexity: {feature.complexity}</span>
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
}: {
  features: Feature[];
  projectSides: ProjectSide[];
  selectedFeatures: Feature[];
  onFeatureToggle: (feature: Feature) => void;
  onFeatureRemove: (feature: Feature) => void;
}) {
  return (
    <div className="space-y-8">
      {projectSides.map((side) => {
        const sideFeatures = features.filter((f) => f.projectSide === side);
        if (sideFeatures.length === 0) return null;

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
  suggestedFeatures: initialSuggestedFeatures,
}: ProjectFeaturesProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>(
    initialSuggestedFeatures
  );
  const [suggestedFeatures, setSuggestedFeatures] = useState<Feature[]>(
    initialSuggestedFeatures
  );
  const [currentPhase, setCurrentPhase] = useState<
    "alpha" | "beta" | "production"
  >("alpha");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFeature, setNewFeature] = useState<Feature>({
    title: "",
    description: "",
    estimatedTimeline: "2 weeks",
    estimatedPrice: 2000,
    phase: "beta",
    complexity: "medium",
    projectSide: "frontend",
  });

  const projectSides = getProjectSides(projectInfo.projectPlatforms);

  const handleFeatureToggle = (feature: Feature) => {
    const isSelected = selectedFeatures.some((f) => f.title === feature.title);
    let newFeatures;

    if (isSelected) {
      newFeatures = selectedFeatures.filter((f) => f.title !== feature.title);
    } else {
      newFeatures = [...selectedFeatures, feature];
    }

    setSelectedFeatures(newFeatures);
    onFeaturesChange(newFeatures);
  };

  const handleFeatureRemove = (feature: Feature) => {
    const updatedFeatures = suggestedFeatures.filter(
      (f) => f.title !== feature.title
    );
    const updatedSelected = selectedFeatures.filter(
      (f) => f.title !== feature.title
    );
    setSuggestedFeatures(updatedFeatures);
    setSelectedFeatures(updatedSelected);
    onFeaturesChange(updatedSelected);
  };

  const handleAddFeature = () => {
    if (newFeature.title && newFeature.description) {
      const featureWithPhase = { ...newFeature, phase: currentPhase };
      const updatedFeatures = [...suggestedFeatures, featureWithPhase];
      setSuggestedFeatures(updatedFeatures);
      setSelectedFeatures([...selectedFeatures, featureWithPhase]);
      onFeaturesChange([...selectedFeatures, featureWithPhase]);
      setNewFeature({
        title: "",
        description: "",
        estimatedTimeline: "2 weeks",
        estimatedPrice: 2000,
        phase: "beta",
        complexity: "medium",
        projectSide: "frontend",
      });
      setIsDialogOpen(false);
    }
  };

  const currentPhaseFeatures = suggestedFeatures.filter(
    (feature) => feature.phase === currentPhase
  );

  return (
    <div className="w-full space-y-8 text-white">
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="text-sm text-white/60">
            Select/Customize your project Features
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            Feature list
          </h2>
          <p className="text-base text-white/60">
            These are AI generated Features for your project
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-[100px] w-[300px] bg-card/50 animate-pulse rounded-xl border border-border/50"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <Tabs
            defaultValue="alpha"
            value={currentPhase}
            onValueChange={(value: any) => setCurrentPhase(value)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="alpha">Alpha (MVP)</TabsTrigger>
              <TabsTrigger value="beta">Beta</TabsTrigger>
              <TabsTrigger value="production">Production</TabsTrigger>
            </TabsList>

            <TabsContent value={currentPhase} className="mt-6">
              <FeaturesByProjectSide
                features={currentPhaseFeatures}
                projectSides={projectSides}
                selectedFeatures={selectedFeatures}
                onFeatureToggle={handleFeatureToggle}
                onFeatureRemove={handleFeatureRemove}
              />
            </TabsContent>
          </Tabs>

          {/* Add Feature Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <div className="border-2 border-dashed border-primary2/30 hover:border-primary2/50 rounded-xl p-6 flex items-center justify-center cursor-pointer transition-all duration-300 backdrop-blur-sm group hover:shadow-[0_0_15px_rgba(168,85,247,0.1)] h-[100px] w-[200px]">
                <Button
                  variant="outline"
                  className="w-full h-full flex items-center gap-2 border-0 text-primary2/70 hover:text-primary2 hover:bg-primary2/5"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Feature</span>
                </Button>
              </div>
            </DialogTrigger>
            <DialogContent className="bg-[#1A1A1A] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Add New Feature</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">
                    Title
                  </label>
                  <Input
                    placeholder="Enter feature title"
                    value={newFeature.title}
                    onChange={(e) =>
                      setNewFeature({ ...newFeature, title: e.target.value })
                    }
                    className="bg-black/40 border-white/10 focus-visible:ring-primary2 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">
                    Description
                  </label>
                  <Textarea
                    placeholder="Enter feature description"
                    value={newFeature.description}
                    onChange={(e) =>
                      setNewFeature({
                        ...newFeature,
                        description: e.target.value,
                      })
                    }
                    className="bg-black/40 border-white/10 focus-visible:ring-primary2 min-h-[100px] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">
                    Project Side
                  </label>
                  <Select
                    value={newFeature.projectSide}
                    onValueChange={(value: any) =>
                      setNewFeature({ ...newFeature, projectSide: value })
                    }
                  >
                    <SelectTrigger className="bg-black/40 border-white/10">
                      <SelectValue placeholder="Select project side" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectSides.map((side) => (
                        <SelectItem key={side} value={side}>
                          {getProjectSideLabel(side)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddFeature}
                  disabled={!newFeature.title || !newFeature.description}
                  className="w-full bg-primary2 hover:bg-primary2/90 text-white"
                >
                  Add Feature
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
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
