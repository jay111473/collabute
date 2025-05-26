import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Loader2,
  X,
  HelpCircle,
  CheckIcon,
  Sparkles,
  Globe,
  Smartphone,
  Monitor,
  Brain,
  Laptop,
  Plus,
  LockIcon,
  ArrowLeftIcon,
} from "lucide-react";
import { Industry } from "@/types/wizard";
import { ALL_INDUSTRIES } from "@/lib/utils/industries";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

// Add CSS for the shake animation
const shakeAnimation = `
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  50% { transform: translateX(4px); }
  75% { transform: translateX(-4px); }
  100% { transform: translateX(0); }
}
.animate-shake {
  animation: shake 0.4s ease-in-out;
}
`;

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
  projectPlatforms: { value: string; isCore?: boolean }[];
}

interface PlatformSuggestion {
  type: "website" | "ios" | "android" | "desktop" | "pwa" | "rest-api" | "graphql-api" | "database" | "auth-service" | "file-storage" | "real-time" | "ai-service" | "payment-service";
  isOptional: boolean;
  priority: number;
  description: string;
  category: "frontend" | "backend";
}

// Available platforms for manual selection
const AVAILABLE_FRONTEND_PLATFORMS = [
  {
    value: "website",
    label: "Website",
    description: "A responsive web application accessible on browsers",
  },
  {
    value: "ios",
    label: "iOS App",
    description: "Native mobile application for Apple iOS devices",
  },
  {
    value: "android",
    label: "Android App",
    description: "Native mobile application for Android devices",
  },
  {
    value: "desktop",
    label: "Desktop App",
    description: "Native application for Windows, MacOS, or Linux",
  },
  {
    value: "pwa",
    label: "PWA",
    description: "Progressive Web App with offline capabilities",
  },
];

const AVAILABLE_BACKEND_PLATFORMS = [
  {
    value: "rest-api",
    label: "REST API",
    description: "RESTful API service for data operations",
  },
  {
    value: "graphql-api",
    label: "GraphQL API",
    description: "GraphQL API service with flexible queries",
  },
  {
    value: "database",
    label: "Database",
    description: "Database storage system for data persistence",
  },
  {
    value: "auth-service",
    label: "Authentication",
    description: "User authentication and authorization service",
  },
  {
    value: "file-storage",
    label: "File Storage",
    description: "File upload and storage service",
  },
  {
    value: "real-time",
    label: "Real-time",
    description: "Real-time communication via WebSocket or SSE",
  },
  {
    value: "ai-service",
    label: "AI Service",
    description: "AI/ML integration and processing capabilities",
  },
  {
    value: "payment-service",
    label: "Payment Service",
    description: "Payment processing and transaction handling",
  },
];

// Styles
const INPUT_BASE_STYLES =
  "border border-darkPrimary/40 shadow-[0_0_15px_rgba(123,97,255,0.15)] hover:shadow-[0_0_20px_rgba(123,97,255,0.25)] focus:shadow-[0_0_25px_rgba(123,97,255,0.35)] hover:border-darkPrimary/60 focus:border-darkPrimary transition-all duration-200 text-white";

// Platform Icons
const getPlatformIcon = (type: string) => {
  switch (type) {
    case "website":
      return <Globe className="h-5 w-5 text-blue-400" />;
    case "ios":
      return <Smartphone className="h-5 w-5 text-gray-300" />;
    case "android":
      return <Smartphone className="h-5 w-5 text-green-400" />;
    case "desktop":
      return <Monitor className="h-5 w-5 text-purple-400" />;
    case "pwa":
      return <Globe className="h-5 w-5 text-indigo-400" />;
    case "rest-api":
      return <Brain className="h-5 w-5 text-green-400" />;
    case "graphql-api":
      return <Brain className="h-5 w-5 text-pink-400" />;
    case "database":
      return <Brain className="h-5 w-5 text-blue-400" />;
    case "auth-service":
      return <LockIcon className="h-5 w-5 text-yellow-400" />;
    case "file-storage":
      return <Brain className="h-5 w-5 text-orange-400" />;
    case "real-time":
      return <Brain className="h-5 w-5 text-red-400" />;
    case "ai-service":
      return <Brain className="h-5 w-5 text-yellow-400" />;
    case "payment-service":
      return <Brain className="h-5 w-5 text-green-500" />;
    default:
      return <Laptop className="h-5 w-5 text-gray-400" />;
  }
};

function LoadingState() {
  return (
    <div className="flex items-center gap-2 text-primary2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">AI is analyzing your project...</span>
    </div>
  );
}

function PlatformCard({
  platform,
  isSelected,
  isCore,
  onToggle,
}: {
  platform: {
    type: string;
    description: string;
    isOptional: boolean;
  };
  isSelected: boolean;
  isCore?: boolean;
  onToggle: () => void;
}) {
  const getPlatformLabel = (type: string) => {
    switch (type) {
      case "ios": return "iOS App";
      case "android": return "Android App";
      case "pwa": return "PWA";
      case "rest-api": return "REST API";
      case "graphql-api": return "GraphQL API";
      case "auth-service": return "Authentication";
      case "file-storage": return "File Storage";
      case "real-time": return "Real-time";
      case "ai-service": return "AI Service";
      case "payment-service": return "Payment Service";
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const platformLabel = getPlatformLabel(platform.type);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "flex flex-col p-4 rounded-xl border cursor-pointer transition-all h-full",
        isSelected
          ? "border-darkPrimary bg-darkPrimary/10 hover:bg-darkPrimary/20"
          : "border-white/10 hover:bg-zinc-800/50 hover:border-white/20"
      )}
      onClick={onToggle}
      data-platform-id={platform.type}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          {getPlatformIcon(platform.type)}
          <span className="ml-2 font-medium text-white">{platformLabel}</span>
        </div>

        <div className="flex items-center space-x-2">
          {isCore && (
            <Badge
              variant="outline"
              className="text-[10px] h-4 bg-darkPrimary/10 border-darkPrimary/20 text-darkPrimary"
            >
              Core
            </Badge>
          )}

          <div
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
              isSelected
                ? "border-darkPrimary bg-darkPrimary"
                : "border-zinc-700"
            )}
          >
            {isSelected && <CheckIcon className="h-3 w-3 text-black" />}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-1 flex-grow">
        {platform.description}
      </p>

      {platform.isOptional && (
        <Badge
          variant="outline"
          className="text-[10px] mt-2 w-fit bg-gray-800/50 border-gray-700 text-gray-400"
        >
          Optional
        </Badge>
      )}
    </motion.div>
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
    projectPlatforms: [],
  });
  const [generatingPlatforms, setGeneratingPlatforms] = useState(false);
  const [platformSuggestions, setPlatformSuggestions] = useState<
    PlatformSuggestion[]
  >([]);
  const [showPlatforms, setShowPlatforms] = useState(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);

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

  const handleGeneratePlatforms = async () => {
    if (!projectInfo.name || !projectInfo.description) return;

    setGeneratingPlatforms(true);
    try {
      const response = await fetch("/api/wizard-platform-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: projectInfo.name,
          description: projectInfo.description,
        }),
      });

      const data = await response.json();

      if (data.frontendPlatforms && data.backendPlatforms) {
        // Combine frontend and backend platforms with category labels
        const allPlatforms: PlatformSuggestion[] = [
          ...data.frontendPlatforms.map((p: any) => ({ ...p, category: "frontend" as const })),
          ...data.backendPlatforms.map((p: any) => ({ ...p, category: "backend" as const })),
        ];
        
        setPlatformSuggestions(allPlatforms);
        setShowPlatforms(true);

        // Set initial platforms based on priority
        const initialPlatforms = allPlatforms
          .filter((p: PlatformSuggestion) => !p.isOptional)
          .map((p: PlatformSuggestion) => ({
            value: p.type,
            isCore: !p.isOptional,
          }));

        updateProjectInfo({ projectPlatforms: initialPlatforms });
      }
    } catch (error) {
      console.error("Error generating platforms:", error);
    } finally {
      setGeneratingPlatforms(false);
    }
  };

  const goBackToDetails = () => {
    setShowPlatforms(false);
  };

  const togglePlatform = (platformType: string) => {
    const isSelected = projectInfo.projectPlatforms.some(
      (p) => p.value === platformType
    );
    const platform = platformSuggestions.find((p) => p.type === platformType);

    if (isSelected) {
      // Don't allow removing core platforms
      if (
        projectInfo.projectPlatforms.find((p) => p.value === platformType)
          ?.isCore
      ) {
        // Show visual feedback for core platforms that can't be removed
        const platformElement = document.querySelector(
          `[data-platform-id="${platformType}"]`
        );
        if (platformElement) {
          platformElement.classList.add("animate-shake");
          setTimeout(() => {
            platformElement.classList.remove("animate-shake");
          }, 500);
        }
        return;
      }
      updateProjectInfo({
        projectPlatforms: projectInfo.projectPlatforms.filter(
          (p) => p.value !== platformType
        ),
      });
    } else {
      updateProjectInfo({
        projectPlatforms: [
          ...projectInfo.projectPlatforms,
          {
            value: platformType,
            isCore: platform ? !platform.isOptional : false,
          },
        ],
      });
    }
  };

  const wordCount = projectInfo.description.trim().split(/\s+/).length;
  const hasEnoughWords = wordCount >= 20;
  const canGeneratePlatforms = !!projectInfo.name && wordCount >= 3;

  // Card variants for animation
  const cardVariants = {
    hidden: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
      transition: {
        type: "spring",
        damping: 30,
        stiffness: 300,
      },
    }),
  };

  return (
    <div className="relative min-h-[500px] flex flex-col items-center justify-center">
      {/* Add style tag for shake animation */}
      <style dangerouslySetInnerHTML={{ __html: shakeAnimation }} />
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-6 space-y-2">
          <h2 className="text-2xl font-bold text-white">
            Tell Us About Your Project
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm">
            Share the details of your project so we can help you build it
            better.
          </p>
        </div>

        {/* Card Container */}
        <div
          className="relative w-full h-[600px] overflow-hidden"
          ref={cardContainerRef}
        >
          <AnimatePresence initial={false} custom={1}>
            {!showPlatforms ? (
              /* Project Details Card */
              <motion.div
                key="details"
                className="absolute w-full h-full"
                custom={1}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="group h-full">
                  <div className="relative h-full">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-darkPrimary/20 to-primary/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative p-5 bg-black rounded-xl space-y-4 h-full flex flex-col">
                      <div className="flex items-center space-x-3 text-xl font-semibold text-white mb-4">
                        <span className="flex h-7 w-7 rounded-full bg-darkPrimary/20 items-center justify-center text-sm">
                          1
                        </span>
                        <h3 className="text-lg">Project Details</h3>
                      </div>

                      <div className="space-y-3 ">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-400">
                            Project Name
                          </label>
                          <Input
                            value={projectInfo.name}
                            onChange={(e) =>
                              handleInputChange(e.target.value, "name")
                            }
                            placeholder="Enter your project name..."
                            className={cn(
                              INPUT_BASE_STYLES,
                              "placeholder:text-gray-500 rounded-lg p-4"
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-400">
                              Project Description
                            </label>
                            <span
                              className={cn(
                                "text-xs font-medium",
                                hasEnoughWords
                                  ? "text-green-500"
                                  : "text-gray-500"
                              )}
                            >
                              {wordCount} words (minimum 20 words){" "}
                              {hasEnoughWords && "✓"}
                            </span>
                          </div>
                          <Textarea
                            value={projectInfo.description}
                            onChange={(e) =>
                              handleInputChange(e.target.value, "description")
                            }
                            placeholder="Describe your project in detail..."
                            className={cn(
                              INPUT_BASE_STYLES,
                              "placeholder:text-gray-500 bg-black dark:bg-black min-h-[150px] rounded-lg p-4 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                            )}
                          />
                        </div>
                      </div
>
                      {/* Generate Platforms Button */}
                      <div className="flex justify-center !mt-10">
                        <Button
                          onClick={handleGeneratePlatforms}
                          disabled={
                            !canGeneratePlatforms || generatingPlatforms
                          }
                          className={cn(
                            "px-8 py-5 text-sm rounded-lg flex items-center gap-2",
                            "bg-darkPrimary hover:dark:bg-darkPrimary/90 hover:dark:text-white dark:bg-darkPrimary text-black dark:text-black"
                          )}
                        >
                          {generatingPlatforms ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              Generating...
                            </>
                          ) : (
                            <>Continue to Platform Selection</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Platforms Card */
              <motion.div
                key="platforms"
                className="absolute w-full h-full"
                custom={-1}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="group h-full">
                  <div className="relative h-full">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-darkPrimary/20 to-primary/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative p-5 bg-black rounded-xl space-y-4 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3 text-xl font-semibold text-white">
                          <span className="flex h-7 w-7 rounded-full bg-darkPrimary/20 items-center justify-center text-sm">
                            2
                          </span>
                          <h3 className="text-lg">Project Platforms</h3>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[300px] p-4 bg-[#1A1A1A] border-white/10">
                                <p className="text-sm text-white/80">
                                  Based on your project description, we&apos;ve
                                  suggested the right platforms for your needs.
                                  Core platforms cannot be removed.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={goBackToDetails}
                            variant="outline"
                            size="sm"
                            className="text-xs bg-zinc-800 border-zinc-700 hover:bg-zinc-700 flex items-center gap-1"
                          >
                            <ArrowLeftIcon className="h-3 w-3" />
                            Back
                          </Button>

                          <Button
                            onClick={handleGeneratePlatforms}
                            variant="outline"
                            size="sm"
                            disabled={generatingPlatforms}
                            className="text-xs bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                          >
                            {generatingPlatforms ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                Regenerating...
                              </>
                            ) : (
                              "Regenerate"
                            )}
                          </Button>
                        </div>
                      </div>

                      {generatingPlatforms ? (
                        <div className="flex items-center justify-center py-16 h-full">
                          <LoadingState />
                        </div>
                      ) : platformSuggestions.length > 0 ? (
                        <div className="space-y-6 flex-grow">
                          {/* Frontend Platforms */}
                          <div>
                            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                              <Monitor className="h-4 w-4 text-blue-400" />
                              Frontend Platforms
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {platformSuggestions
                                .filter((p) => p.category === "frontend")
                            .sort((a, b) => b.priority - a.priority)
                            .map((platform) => (
                              <PlatformCard
                                key={platform.type}
                                platform={platform}
                                isSelected={projectInfo.projectPlatforms.some(
                                  (p) => p.value === platform.type
                                )}
                                isCore={!platform.isOptional}
                                onToggle={() => togglePlatform(platform.type)}
                              />
                            ))}
                            </div>
                              </div>

                          {/* Backend Platforms */}
                          <div>
                            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                              <Brain className="h-4 w-4 text-green-400" />
                              Backend Platforms
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {platformSuggestions
                                .filter((p) => p.category === "backend")
                                .sort((a, b) => b.priority - a.priority)
                                .map((platform) => (
                                  <PlatformCard
                                    key={platform.type}
                                    platform={platform}
                                    isSelected={projectInfo.projectPlatforms.some(
                                      (p) => p.value === platform.type
                                    )}
                                    isCore={!platform.isOptional}
                                    onToggle={() => togglePlatform(platform.type)}
                                  />
                                ))}
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {/* Footer summary */}
                      <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50 mt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-white">
                              {projectInfo.name}
                            </h4>
                            <p className="text-xs text-gray-400 line-clamp-1 max-w-sm">
                              {projectInfo.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            {projectInfo.projectPlatforms.length > 0 && (
                              <>
                                <Badge className="bg-blue-500/30 text-[10px]">
                                  {projectInfo.projectPlatforms.filter(p => 
                                    platformSuggestions.find(ps => ps.type === p.value)?.category === "frontend"
                                  ).length} frontend
                                </Badge>
                                <Badge className="bg-green-500/30 text-[10px]">
                                  {projectInfo.projectPlatforms.filter(p => 
                                    platformSuggestions.find(ps => ps.type === p.value)?.category === "backend"
                                  ).length} backend
                              </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress indicator at the bottom */}
        <div className="mt-6 flex justify-center items-center space-x-2">
          <div
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-colors duration-300",
              !!projectInfo.name ? "bg-darkPrimary" : "bg-gray-700"
            )}
          />
          <div
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-colors duration-300",
              hasEnoughWords ? "bg-darkPrimary" : "bg-gray-700"
            )}
          />
          <div
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-colors duration-300",
              showPlatforms ? "bg-darkPrimary" : "bg-gray-700"
            )}
          />
        </div>
      </div>
    </div>
  );
}
