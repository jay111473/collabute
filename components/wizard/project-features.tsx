import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  XIcon,
  InfoIcon,
  Loader2,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusCircleIcon,
  StarIcon,
  ShieldAlertIcon,
  HashIcon,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Feature, ProjectInfo, Competitor } from "@/types/wizard";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import {
  getPlatformLabel,
  getPlatformColor,
  PlatformIcon,
  PlatformBadge,
} from "@/lib/utils/platform-utils";

// Types
interface ProjectFeaturesProps {
  projectInfo: ProjectInfo;
  competitors: Competitor[];
  onFeaturesChange: (features: Feature[]) => void;
  isLoading: boolean;
  suggestedFeatures: Feature[];
}

interface FeatureCardProps {
  feature: Feature;
  onRemove: () => void;
}

interface AddFeatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (feature: Feature) => void;
  defaultFeature: Partial<Feature>;
  projectPlatforms: ProjectInfo["projectPlatforms"];
  nextOrderNumber: number;
}

interface FeaturesSectionProps {
  features: Feature[];
  platform: string;
  onRemove: (feature: Feature) => void;
  onAddNew: (platform: string) => void;
}

interface PlatformSectionProps {
  platform: string;
  features: Feature[];
  onRemove: (feature: Feature) => void;
  onAddNew: (platform: string) => void;
}

// Utility Functions - now imported from platform-utils

// Components
const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onRemove }) => (
  <div
    className={cn(
      "group relative p-4 rounded-xl transition-all duration-300 h-full",
      "bg-[#141414] border border-zinc-800 hover:border-darkPrimary/50 hover:shadow-[0_0_20px_rgba(123,97,255,0.15)]",
      feature.isCore && "ring-1 ring-darkPrimary/40"
    )}
  >
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium text-white">{feature.title}</h3>
          {feature.isCore && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex">
                    <StarIcon className="h-4 w-4 text-darkPrimary" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Core feature (cannot be removed)
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {!feature.isCore && (
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mt-1 -mr-2 shrink-0"
            onClick={onRemove}
          >
            <XIcon className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <p className="text-sm text-white/60 mt-2 line-clamp-3 flex-grow">
        {feature.description}
      </p>

      <div className="flex items-center gap-3 text-xs text-white/60 mt-4 pt-2 border-t border-zinc-800">
        <div className="flex items-center gap-1.5">
          <HashIcon className="h-3.5 w-3.5" />
          <span>Order: {feature.order}</span>
        </div>
        {feature.isCore ? (
          <Badge className="bg-darkPrimary/20 text-darkPrimary border-none">
            Core Feature
          </Badge>
        ) : (
          <Badge className="bg-zinc-800/50 text-zinc-400 border-zinc-700">
            Optional
          </Badge>
        )}
      </div>
    </div>
  </div>
);

const FeatureTooltip: React.FC<{ feature: Feature }> = ({ feature }) => (
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
          <p className="text-sm text-white/80 mb-2">{feature.description}</p>
          <div className="flex items-center gap-4 text-xs text-white/60">
            <span>Platform: {getPlatformLabel(feature.platform)}</span>
            <span>Type: {feature.isCore ? "Core" : "Optional"}</span>
            <span>Order: {feature.order}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// Platform Section Component
const PlatformSection: React.FC<PlatformSectionProps> = ({
  platform,
  features,
  onRemove,
  onAddNew,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Sort features by order
  const sortedFeatures = [...features].sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : Number.MAX_SAFE_INTEGER;
    const orderB = b.order !== undefined ? b.order : Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });

  const visibleFeatures = isExpanded
    ? sortedFeatures
    : sortedFeatures.slice(0, 6);
  const hasMoreFeatures = sortedFeatures.length > 6;

  // Count core features
  const coreFeatures = features.filter((f) => f.isCore).length;

  return (
    <div className="space-y-4 pb-6 mb-6 border-b border-zinc-800/50 last:border-0 last:mb-0 last:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-3 mb-2 md:mb-0">
          <div
            className={`h-8 w-8 rounded-md flex items-center justify-center bg-gradient-to-br ${getPlatformColor(
              platform
            )}`}
          >
            <PlatformIcon platform={platform} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">
              {getPlatformLabel(platform)}
            </h3>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-xs bg-zinc-800/50 text-zinc-400 border-zinc-700"
              >
                {features.length} feature{features.length !== 1 ? "s" : ""}
              </Badge>
              {coreFeatures > 0 && (
                <Badge
                  variant="outline"
                  className="text-xs bg-darkPrimary/20 text-darkPrimary border-none"
                >
                  {coreFeatures} core
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-darkPrimary/10 border-darkPrimary/20 hover:bg-darkPrimary/20 text-darkPrimary"
          onClick={() => onAddNew(platform)}
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Add Feature
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleFeatures.map((feature) => (
          <FeatureCard
            key={feature.title}
            feature={feature}
            onRemove={() => onRemove(feature)}
          />
        ))}
      </div>

      {hasMoreFeatures && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            size="sm"
            className="text-zinc-400 hover:text-white flex items-center gap-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUpIcon className="h-4 w-4" />
                <span>Show less</span>
              </>
            ) : (
              <>
                <ChevronDownIcon className="h-4 w-4" />
                <span>Show {sortedFeatures.length - 6} more features</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

const AddFeatureDialog: React.FC<AddFeatureDialogProps> = ({
  isOpen,
  onClose,
  onAdd,
  defaultFeature,
  projectPlatforms,
  nextOrderNumber,
}) => {
  const [feature, setFeature] = useState<Partial<Feature>>(defaultFeature);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFeature({
        ...defaultFeature,
        order: nextOrderNumber,
      });
    }
  }, [isOpen, defaultFeature, nextOrderNumber]);

  const handleSubmit = () => {
    if (feature.title && feature.description && feature.platform) {
      // Add placeholder price and isCore default values if not provided
      const completeFeature = {
        ...feature,
        estimatedPrice: feature.estimatedPrice || "0",
        isCore: feature.isCore || false,
        order: feature.order || nextOrderNumber,
      } as Feature;

      onAdd(completeFeature);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Feature</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm text-white/60 font-medium">
              Feature Title
            </label>
            <Input
              placeholder="Enter feature title"
              value={feature.title}
              onChange={(e) =>
                setFeature((prev) => ({ ...prev, title: e.target.value }))
              }
              className="bg-zinc-900 border-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/60 font-medium">
              Description
            </label>
            <Textarea
              placeholder="Describe what this feature does"
              value={feature.description}
              onChange={(e) =>
                setFeature((prev) => ({ ...prev, description: e.target.value }))
              }
              className="bg-zinc-900 border-zinc-700 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-white/60 font-medium">
                Platform
              </label>
              <Select
                value={feature.platform}
                onValueChange={(value) =>
                  setFeature((prev) => ({
                    ...prev,
                    platform: value as Feature["platform"],
                  }))
                }
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-700">
                  <SelectValue placeholder="Select Platform" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {projectPlatforms.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-5 w-5 rounded-sm flex items-center justify-center bg-gradient-to-br ${getPlatformColor(
                            platform.value
                          )}`}
                        >
                          <PlatformIcon
                            platform={platform.value}
                            className="text-white"
                            size="sm"
                          />
                        </div>
                        {getPlatformLabel(platform.value)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/60 font-medium">Type</label>
              <Select
                value={feature.isCore ? "core" : "optional"}
                onValueChange={(value) =>
                  setFeature((prev) => ({
                    ...prev,
                    isCore: value === "core",
                  }))
                }
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-700">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="core">
                    <div className="flex items-center gap-2">
                      <StarIcon className="h-4 w-4 text-darkPrimary" />
                      Core Feature
                    </div>
                  </SelectItem>
                  <SelectItem value="optional">
                    <div className="flex items-center gap-2">
                      Optional Feature
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/60 font-medium">
                Order Number
              </label>
              <Input
                type="number"
                placeholder="Implementation order"
                value={
                  feature.order !== undefined ? feature.order : nextOrderNumber
                }
                onChange={(e) =>
                  setFeature((prev) => ({
                    ...prev,
                    order: parseInt(e.target.value) || nextOrderNumber,
                  }))
                }
                className="bg-zinc-900 border-zinc-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-darkPrimary text-black hover:bg-darkPrimary/90"
            >
              Add Feature
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Empty State
const EmptyFeaturesState = ({
  onAddNew,
}: {
  onAddNew: (platform: string) => void;
}) => (
  <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50">
    <div className="h-12 w-12 rounded-full bg-darkPrimary/20 flex items-center justify-center mb-4">
      <PlusCircleIcon className="h-6 w-6 text-darkPrimary" />
    </div>
    <h3 className="text-lg font-medium text-white mb-2">
      No Features Added Yet
    </h3>
    <p className="text-white/60 mb-6 max-w-md">
      Features help define what your MVP will include. Add your first feature to
      get started.
    </p>
    <Button
      className="bg-darkPrimary text-black hover:bg-darkPrimary/90"
      onClick={() => onAddNew("website")}
    >
      <PlusIcon className="h-4 w-4 mr-2" />
      Add First Feature
    </Button>
  </div>
);

// Main Component
export function ProjectFeatures({
  projectInfo,
  competitors,
  onFeaturesChange,
  isLoading,
  suggestedFeatures,
}: ProjectFeaturesProps) {
  const [features, setFeatures] = useState<Feature[]>(suggestedFeatures);
  const [showAddFeatureDialog, setShowAddFeatureDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] =
    useState<Feature["platform"]>("website");

  // Calculate next order number for new features
  const nextOrderNumber =
    features.length > 0
      ? Math.max(
          ...features.map((f) => (f.order !== undefined ? f.order : 0))
        ) + 1
      : 1;

  const defaultNewFeature: Partial<Feature> = {
    title: "",
    description: "",
    platform: selectedPlatform,
    isCore: false,
    order: nextOrderNumber,
  };

  useEffect(() => {
    // Ensure all features have an order number
    const processedFeatures = suggestedFeatures.map((feature, index) => {
      if (feature.order === undefined) {
        return {
          ...feature,
          order: index + 1,
        };
      }
      return feature;
    });

    setFeatures(processedFeatures);
  }, [suggestedFeatures]);

  const handleFeatureRemove = (feature: Feature) => {
    // If it's a core feature, don't remove it
    if (feature.isCore) return;

    const newFeatures = features.filter((f) => f.title !== feature.title);
    setFeatures(newFeatures);
    onFeaturesChange(newFeatures);
  };

  const handleAddFeature = (feature: Feature) => {
    const newFeatures = [...features, feature];
    setFeatures(newFeatures);
    onFeaturesChange(newFeatures);
    setShowAddFeatureDialog(false);
  };

  const handleAddNewFeature = (platform: string) => {
    setSelectedPlatform(platform as Feature["platform"]);
    setShowAddFeatureDialog(true);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  // Group features by platform
  const featuresByPlatform = features.reduce((acc, feature) => {
    if (!acc[feature.platform]) {
      acc[feature.platform] = [];
    }
    acc[feature.platform].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

  // No features added yet
  if (!features.length) {
    return <EmptyFeaturesState onAddNew={handleAddNewFeature} />;
  }

  // Count core features
  const coreFeatures = features.filter((f) => f.isCore).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">MVP Features</h2>
          <p className="text-gray-400 text-sm">
            Define the core features for your minimum viable product
          </p>
        </div>

        <div className="flex gap-2">
          <Badge className="bg-zinc-800/50 text-zinc-400 border-zinc-700 py-1.5 px-3">
            {features.length} Total
          </Badge>
          {coreFeatures > 0 && (
            <Badge className="bg-darkPrimary/20 text-darkPrimary border-none py-1.5 px-3">
              {coreFeatures} Core
            </Badge>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
        <div className="p-4 bg-zinc-800/30 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-darkPrimary/20 flex items-center justify-center">
              <StarIcon className="h-3.5 w-3.5 text-darkPrimary" />
            </div>
            <span className="text-sm font-medium text-white">MVP Features</span>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-xs text-gray-400 cursor-help">
                  <HashIcon className="h-3.5 w-3.5 text-darkPrimary mr-1" />
                  Implementation order indicates feature dependencies
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-sm">
                  Features are ordered by their technical implementation
                  sequence. Lower numbers should be implemented first.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <ScrollArea className="h-[calc(100vh-320px)] min-h-[400px]">
          <div className="p-6">
            {Object.entries(featuresByPlatform).map(
              ([platform, platformFeatures]) => (
                <PlatformSection
                  key={platform}
                  platform={platform}
                  features={platformFeatures}
                  onRemove={handleFeatureRemove}
                  onAddNew={handleAddNewFeature}
                />
              )
            )}
          </div>
        </ScrollArea>
      </div>

      <AddFeatureDialog
        isOpen={showAddFeatureDialog}
        onClose={() => setShowAddFeatureDialog(false)}
        onAdd={handleAddFeature}
        defaultFeature={{
          ...defaultNewFeature,
          platform: selectedPlatform,
        }}
        projectPlatforms={projectInfo.projectPlatforms}
        nextOrderNumber={nextOrderNumber}
      />
    </div>
  );
}

const LoadingState = () => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="max-w-md w-full">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Wrapping up your project
          </h2>
          <p className="text-base text-gray-400">
            We&apos;re wrapping up your project and preparing the final
            details...
          </p>
        </div>
        <div className="flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-darkPrimary" />
        </div>
      </div>
    </div>
  </div>
);
