import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, XIcon, InfoIcon, RefreshCcw, Loader2, ClockIcon } from "lucide-react";
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
  <div className="group relative p-5 rounded-xl transition-all duration-300 h-full
    bg-[#141414] border border-zinc-800 hover:border-darkPrimary/50 hover:shadow-[0_0_20px_rgba(123,97,255,0.15)]">
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-medium text-white">
          {feature.title}
        </h3>
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mt-1 -mr-2 shrink-0"
          onClick={onRemove}
        >
          <XIcon className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      <p className="text-sm text-white/60 mt-2 line-clamp-2">
        {feature.description}
      </p>

      <div className="flex items-center gap-3 text-xs text-white/60 mt-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-1.5">
          <ClockIcon className="h-3.5 w-3.5" />
          {feature.estimatedTimeline}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "w-2 h-2 rounded-full",
            feature.complexity === 'simple' && "bg-emerald-500",
            feature.complexity === 'medium' && "bg-blue-500",
            feature.complexity === 'complex' && "bg-violet-500"
          )} />
          <span className={cn(
            "capitalize",
            feature.complexity === 'simple' && "text-emerald-400",
            feature.complexity === 'medium' && "text-blue-400",
            feature.complexity === 'complex' && "text-violet-400"
          )}>
            {feature.complexity}
          </span>
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

  // Map technical platforms to business platforms
  const mapToPlatform = (value: string): "web" | "mobile" | "desktop" | "ai" => {
    const platformMap: Record<string, "web" | "mobile" | "desktop" | "ai"> = {
      'frontend': 'web',
      'backend': 'web',
      'ios': 'mobile',
      'android': 'mobile',
      'windows': 'desktop',
      'macos': 'desktop',
      'cross-platform-mobile': 'mobile',
      'cross-platform-desktop': 'desktop',
      'ai': 'ai',
      'fullstack': 'web'
    };
    return platformMap[value] || 'web';
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
                onValueChange={(value) => setFeature(prev => ({ 
                  ...prev, 
                  platform: mapToPlatform(value)
                }))}
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
  const [showAddFeatureDialog, setShowAddFeatureDialog] = useState(false);
  const [newFeatureSide, setNewFeatureSide] = useState<ProjectSide>("frontend");

  const defaultNewFeature: Partial<Feature> = {
    title: "",
    description: "",
    estimatedTimeline: "",
    complexity: "simple",
    platform: "web",
    projectSide: newFeatureSide,
  };

  useEffect(() => {
    setFeatures(suggestedFeatures);
  }, [suggestedFeatures]);

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

  if (isLoading) {
    return <LoadingState />;
  }

  if (!features.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-white/60 mb-4">No features have been added yet.</p>
      </div>
    );
  }

  // Group features by platform for business view
  const featuresByPlatform = features.reduce((acc, feature) => {
    const platformMap: Record<string, string> = {
      'frontend': 'Web',
      'backend': 'Web',
      'ios': 'Mobile',
      'android': 'Mobile',
      'windows': 'Desktop',
      'macos': 'Desktop',
      'cross-platform-mobile': 'Mobile',
      'cross-platform-desktop': 'Desktop',
      'ai': 'AI',
      'fullstack': 'Web'
    };
    
    const businessPlatform = platformMap[feature.platform] || feature.platform;
    if (!acc[businessPlatform]) {
      acc[businessPlatform] = [];
    }
    acc[businessPlatform].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

  return (
    <div className="space-y-8">
      <Tabs defaultValue="mvp" className="w-full">
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <TabsList className="relative inline-flex mb-6 bg-[#1A1A1A] p-1">
            <TabsTrigger value="mvp" className="relative z-10 px-8">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-medium">MVP Features</span>
                <div className="h-1 w-full bg-darkPrimary rounded-full" />
              </div>
            </TabsTrigger>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="roadmap" disabled className="relative z-10 px-8 opacity-50 cursor-not-allowed">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-medium">Product Roadmap</span>
                      <div className="h-1 w-full bg-zinc-700 rounded-full" />
                    </div>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[300px] bg-[#1A1A1A] border-white/10 p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-darkPrimary animate-pulse" />
                      <p className="text-sm font-medium text-white">Locked: Complete MVP First</p>
                    </div>
                    <p className="text-sm text-white/80">
                      Focus on your core features! Once you&apos;ve built your MVP, we&apos;ll unlock an exciting roadmap with advanced features and future possibilities.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-zinc-800 -translate-y-1/2" />
          </TabsList>
          
          <div className="flex items-center gap-2 text-sm text-white/60">
            <div className="w-2 h-2 rounded-full bg-darkPrimary" />
            <span>Current Phase: MVP Development</span>
          </div>
        </div>

        <TabsContent value="mvp" className="space-y-6">
          {Object.entries(featuresByPlatform).map(([platform, platformFeatures]) => (
            <div key={platform}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-medium text-white">
                    {platform}
                  </h3>
                  <span className="text-sm text-white/60">
                    {platformFeatures.length} feature{platformFeatures.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleAddNewFeature(platformFeatures[0]?.projectSide || "frontend")}
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Feature
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {platformFeatures.map((feature) => (
                  <FeatureCard
                    key={feature.title}
                    feature={feature}
                    onRemove={() => handleFeatureRemove(feature)}
                  />
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <AddFeatureDialog
        isOpen={showAddFeatureDialog}
        onClose={() => setShowAddFeatureDialog(false)}
        onAdd={handleAddFeature}
        defaultFeature={{
          ...defaultNewFeature,
          projectSide: newFeatureSide,
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
          <h2 className="text-2xl font-semibold text-white">Generating Features</h2>
          <p className="text-base text-gray-400">
            Please wait while we create your feature list...
          </p>
        </div>
        <div className="flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-darkPrimary" />
        </div>
      </div>
    </div>
  </div>
);
