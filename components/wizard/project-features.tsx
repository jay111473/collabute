import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, XIcon, InfoIcon, RefreshCcw, Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

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
  projectPlatforms: ProjectInfo['projectPlatforms'];
}

interface FeaturesSectionProps {
  features: Feature[];
  projectSide: ProjectSide;
  onRemove: (feature: Feature) => void;
  onAddNew: (side: ProjectSide) => void;
}

// Utility Functions
const getProjectSideLabel = (side: ProjectSide): string => {
  const labels: Record<ProjectSide, string> = {
    frontend: "Frontend",
    backend: "Backend",
    ios: "iOS",
    android: "Android",
    windows: "Windows",
    macos: "macOS",
    "cross-platform": "Cross-Platform",
    ai: "AI/ML",
    devops: "DevOps",
    linux: "Linux",
  };
  return labels[side] || "Unknown";
};

const getProjectSides = (platforms: ProjectInfo['projectPlatforms']): ProjectSide[] => {
  const sideMap: Record<string, ProjectSide[]> = {
    fullstack: ["frontend", "backend"],
    frontend: ["frontend"],
    backend: ["backend"],
    ios: ["ios", "backend"],
    android: ["android", "backend"],
    "cross-platform-mobile": ["cross-platform", "backend"],
    windows: ["windows", "backend"],
    macos: ["macos", "backend"],
    "cross-platform-desktop": ["cross-platform", "backend"],
    ai: ["ai", "backend", "frontend"],
    unknown: ["frontend", "backend"],
  };

  return Array.from(
    new Set(
      platforms.flatMap(platform => sideMap[platform.value] || [])
    )
  );
};

// Components
const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onRemove }) => (
  <div className="group relative p-6 rounded-xl transition-all duration-300 backdrop-blur-sm inline-flex items-center shrink-0 
    bg-[#141414] border border-zinc-800 hover:border-darkPrimary/50 hover:shadow-[0_0_20px_rgba(123,97,255,0.15)]
    before:absolute before:inset-0 before:rounded-xl before:transition-all before:duration-300
    hover:before:shadow-[0_0_30px_rgba(123,97,255,0.15)] before:-z-10">
    <div className="flex items-start gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium leading-none text-white whitespace-nowrap">
              {feature.title}
            </h3>
            <FeatureTooltip feature={feature} />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={onRemove}
          >
            <XIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
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
      <TooltipContent side="top" className="max-w-[400px] bg-[#1A1A1A] border-white/10">
        <div className="space-y-3">
          <p className="text-sm text-white/80 mb-2">{feature.description}</p>
          <div className="flex items-center gap-4 text-xs text-white/60">
            <span>Timeline: {feature.estimatedTimeline}</span>
            <span>Complexity: {feature.complexity}</span>
            <span>Platform: {feature.platform}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  features,
  projectSide,
  onRemove,
  onAddNew,
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium text-white capitalize">
        {getProjectSideLabel(projectSide)} Features
      </h3>
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => onAddNew(projectSide)}
      >
        <PlusIcon className="h-4 w-4" />
        Add {getProjectSideLabel(projectSide)} Feature
      </Button>
    </div>
    <div className="grid grid-cols-1 gap-4">
      {features.map((feature) => (
        <FeatureCard
          key={feature.title}
          feature={feature}
          onRemove={() => onRemove(feature)}
        />
      ))}
    </div>
  </div>
);

const AddFeatureDialog: React.FC<AddFeatureDialogProps> = ({
  isOpen,
  onClose,
  onAdd,
  defaultFeature,
  projectPlatforms,
}) => {
  const [feature, setFeature] = useState<Partial<Feature>>(defaultFeature);

  const handleSubmit = () => {
    if (feature.title && feature.description) {
      onAdd(feature as Feature);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Feature</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Feature Title"
            value={feature.title}
            onChange={(e) => setFeature(prev => ({ ...prev, title: e.target.value }))}
          />
          <Textarea
            placeholder="Feature Description"
            value={feature.description}
            onChange={(e) => setFeature(prev => ({ ...prev, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-white/60">Platform</label>
              <Select
                value={feature.platform}
                onValueChange={(value) => setFeature(prev => ({ ...prev, platform: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Platform" />
                </SelectTrigger>
                <SelectContent>
                  {projectPlatforms.map((platform) => (
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
                value={feature.complexity}
                onValueChange={(value) => 
                  setFeature(prev => ({
                    ...prev,
                    complexity: value as "simple" | "medium" | "complex"
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
          <div className="space-y-2">
            <label className="text-sm text-white/60">Timeline</label>
            <Input
              placeholder="e.g., 2 weeks"
              value={feature.estimatedTimeline}
              onChange={(e) => 
                setFeature(prev => ({
                  ...prev,
                  estimatedTimeline: e.target.value
                }))
              }
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add Feature</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Component
export function ProjectFeatures({
  projectInfo,
  competitors,
  onFeaturesChange,
  isLoading,
  suggestedFeatures,
}: ProjectFeaturesProps) {
  const [features, setFeatures] = useState<Feature[]>(suggestedFeatures);
  const [currentPhase, setCurrentPhase] = useState<"alpha" | "beta" | "production">("alpha");
  const [showAddFeatureDialog, setShowAddFeatureDialog] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState(false);
  const [newFeatureSide, setNewFeatureSide] = useState<ProjectSide>("frontend");
  const [hasRegenerated, setHasRegenerated] = useState(false);

  const defaultNewFeature: Partial<Feature> = {
    title: "",
    description: "",
    estimatedTimeline: "",
    complexity: "simple",
    platform: projectInfo.projectPlatforms[0]?.value || "frontend",
    projectSide: newFeatureSide,
    phase: currentPhase,
  };

  useEffect(() => {
    setFeatures(suggestedFeatures);
  }, [suggestedFeatures]);

  const handleRetry = async () => {
    try {
      setIsRetrying(true);
      setError(false);
      
      const response = await fetch("/api/wizard-features-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: projectInfo.name,
          description: projectInfo.description,
          industries: projectInfo.industries,
          competitors,
          projectPlatforms: projectInfo.projectPlatforms,
          projectScope: projectInfo.projectScope,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate features');

      const data = await response.json();
      if (!data.features?.length) throw new Error('No features generated');

      setFeatures(data.features);
      onFeaturesChange(data.features);
      setError(false);
      setHasRegenerated(true);
    } catch (err) {
      console.error("Error retrying feature generation:", err);
      setError(true);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleFeatureRemove = (feature: Feature) => {
    const newFeatures = features.filter(f => f.title !== feature.title);
    setFeatures(newFeatures);
    onFeaturesChange(newFeatures);
  };

  const handleAddFeature = (feature: Feature) => {
    const newFeatures = [...features, feature];
    setFeatures(newFeatures);
    onFeaturesChange(newFeatures);
    setShowAddFeatureDialog(false);
  };

  const handleAddNewFeature = (side: ProjectSide) => {
    setNewFeatureSide(side);
    setShowAddFeatureDialog(true);
  };

  if (isLoading || isRetrying) {
    return <LoadingState />;
  }

  if (error || !features.length) {
    return <ErrorState onRetry={handleRetry} />;
  }

  const currentPhaseFeatures = features.filter(f => f.phase === currentPhase);
  const projectSides = getProjectSides(projectInfo.projectPlatforms);

  return (
    <div className="space-y-6">
      <Header 
        onRetry={handleRetry} 
        hasRegenerated={hasRegenerated}
        isRegenerating={isRetrying}
      />
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
          <TabsTrigger value="alpha" className="text-white data-[state=active]:text-primary2">Alpha</TabsTrigger>
          <TabsTrigger value="beta" className="text-white data-[state=active]:text-primary2">Beta</TabsTrigger>
          <TabsTrigger value="production" className="text-white data-[state=active]:text-primary2">Production</TabsTrigger>
        </TabsList>

        <TabsContent value={currentPhase} className="mt-6">
          <div className="space-y-8">
            {projectSides.map((side) => (
              <FeaturesSection
                key={side}
                features={currentPhaseFeatures.filter(f => f.projectSide === side)}
                projectSide={side}
                onRemove={handleFeatureRemove}
                onAddNew={handleAddNewFeature}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <AddFeatureDialog
        isOpen={showAddFeatureDialog}
        onClose={() => setShowAddFeatureDialog(false)}
        onAdd={handleAddFeature}
        defaultFeature={{
          ...defaultNewFeature,
          projectSide: newFeatureSide,
          phase: currentPhase,
        }}
        projectPlatforms={projectInfo.projectPlatforms}
      />
    </div>
  );
}

const LoadingState = () => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="max-w-md w-full">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold text-white">Project Features</h2>
          <p className="text-base text-gray-400">
            Generating features for your project...
          </p>
        </div>
        <div className="flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-darkPrimary" />
        </div>
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[100px] w-full bg-zinc-900/50 animate-pulse rounded-xl border border-zinc-800/50"
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
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
        <Button onClick={onRetry} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Retry Feature Generation
        </Button>
      </div>
    </div>
  </div>
);

const Header = ({ 
  onRetry, 
  hasRegenerated,
  isRegenerating 
}: { 
  onRetry: () => void;
  hasRegenerated: boolean;
  isRegenerating: boolean;
}) => {
  const handleRegenerate = async () => {
    await onRetry();
  };

  return (
    <>
      {isRegenerating && <LoadingState />}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Project Features</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={handleRegenerate} 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 relative group"
                        disabled={hasRegenerated}
                      >
                        <RefreshCcw className={cn(
                          "h-3 w-3 transition-all",
                          !hasRegenerated && "group-hover:rotate-180"
                        )} />
                        Regenerate Features
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-zinc-900 border-zinc-800">
                      <p className="text-sm text-zinc-400">
                        {hasRegenerated 
                          ? "Feature regeneration can only be used once"
                          : "Not satisfied? Generate a new set of features based on your requirements"
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <p className="text-xs text-zinc-500">
                  {hasRegenerated ? "No attempts remaining" : "1 attempt remaining"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-white/60">
            We organize development into three strategic phases to ensure efficient resource allocation and systematic feature delivery.
          </p>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-medium text-white">Development Phases Explained</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <p className="font-medium text-primary2">Alpha Phase (Foundation)</p>
                <p className="text-zinc-400">Core system architecture and essential functionalities. This phase focuses on building the fundamental infrastructure, critical APIs, and basic user flows. Helps technical teams validate architecture decisions and establish development patterns.</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-primary2">Beta Phase (Enhancement)</p>
                <p className="text-zinc-400">Feature enrichment and system robustness. Development focuses on expanding core functionalities, implementing secondary features, and enhancing system reliability. Includes comprehensive testing and performance optimization.</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-primary2">Production Phase (Refinement)</p>
                <p className="text-zinc-400">Advanced features and system maturity. This phase covers sophisticated functionalities, third-party integrations, and scalability improvements. Focuses on production-grade features that complete your product vision.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
