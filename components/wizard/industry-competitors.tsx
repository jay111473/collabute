import React from "react";
import { cn } from "@/lib/utils";
import {
  Loader2,
  CheckIcon,
  X,
  Star,
  Trophy,
  Rocket,
  Building2,
  DollarSign,
  Target,
  BarChart3,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  Feature,
  Category,
  Competitor,
  FeatureComparisonData,
} from "@/types/wizard";

interface UserProject {
  name: string;
  features: Record<string, boolean>;
}

interface FeatureComparisonMatrixProps {
  onDataChange?: (data: FeatureComparisonData) => void;
  isLoading?: boolean;
  comparisonData?: FeatureComparisonData;
  onRetry?: () => void;
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary2/20 to-darkPrimary/20 rounded-full blur-xl"></div>
          <Loader2 className="relative h-10 w-10 animate-spin text-primary2 mx-auto" />
        </div>
        <div className="space-y-2">
          <p className="text-white font-medium">AI is analyzing your project</p>
          <p className="text-gray-400 text-sm">
            Generating comprehensive feature comparison...
          </p>
        </div>
      </div>
    </div>
  );
}

function Tooltip({
  content,
  children,
}: {
  content: string;
  children: React.ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("top");
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;

      // If there's more space below or we're in the top 200px, show below
      setPosition(
        spaceAbove < 200 || spaceBelow > spaceAbove ? "bottom" : "top"
      );
    }
  }, [isVisible]);

  return (
    <div className="relative inline-block" ref={tooltipRef}>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: position === "top" ? 8 : -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={cn(
            "absolute z-50 left-1/2 transform -translate-x-1/2 px-4 py-3 bg-zinc-900/95 backdrop-blur-sm text-white text-sm rounded-lg border border-zinc-700/50 shadow-xl min-w-80 max-w-96 text-left",
            position === "top" ? "bottom-full mb-2" : "top-full mt-2"
          )}
        >
          <div className="relative">
            <p className="leading-relaxed">{content}</p>
            <div
              className={cn(
                "absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-transparent",
                position === "top"
                  ? "top-full border-t-4 border-t-zinc-900/95"
                  : "bottom-full border-b-4 border-b-zinc-900/95"
              )}
            ></div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function getCompetitorTypeIcon(type: string) {
  const iconProps = "h-4 w-4";
  switch (type) {
    case "Market Leader":
      return <Trophy className={`${iconProps} text-amber-400`} />;
    case "Innovative Startup":
      return <Rocket className={`${iconProps} text-cyan-400`} />;
    case "Enterprise Solution":
      return <Building2 className={`${iconProps} text-indigo-400`} />;
    case "Budget Option":
      return <DollarSign className={`${iconProps} text-emerald-400`} />;
    case "Niche Player":
      return <Target className={`${iconProps} text-orange-400`} />;
    default:
      return <Building2 className={`${iconProps} text-gray-400`} />;
  }
}

function getCompetitorTypeColor(type: string) {
  switch (type) {
    case "Market Leader":
      return "bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-300 border-amber-500/30 shadow-amber-500/10";
    case "Innovative Startup":
      return "bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-cyan-300 border-cyan-500/30 shadow-cyan-500/10";
    case "Enterprise Solution":
      return "bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-300 border-indigo-500/30 shadow-indigo-500/10";
    case "Budget Option":
      return "bg-gradient-to-r from-emerald-500/15 to-green-500/15 text-emerald-300 border-emerald-500/30 shadow-emerald-500/10";
    case "Niche Player":
      return "bg-gradient-to-r from-orange-500/15 to-red-500/15 text-orange-300 border-orange-500/30 shadow-orange-500/10";
    default:
      return "bg-gradient-to-r from-gray-500/15 to-slate-500/15 text-gray-300 border-gray-500/30 shadow-gray-500/10";
  }
}

function getFeatureIcon(iconName: string) {
  const IconComponent = (LucideIcons as any)[iconName] || Building2;
  return <IconComponent className="h-4 w-4 text-zinc-300" />;
}

function CategoryHeader({
  category,
  competitorCount,
}: {
  category: Category;
  competitorCount: number;
}) {
  return (
    <tr>
      <td
        colSpan={competitorCount + 2}
        className="px-6 py-2 bg-gradient-to-r from-zinc-900/95 to-zinc-800/95 border-b border-zinc-700/30"
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary2 to-darkPrimary shadow-sm shadow-primary2/30"></div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            {category.name}
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-zinc-700/50 to-transparent"></div>
          <span className="text-xs text-gray-400 font-medium">
            {category.features.length} features
          </span>
        </div>
      </td>
    </tr>
  );
}

function FeatureRow({
  feature,
  competitors,
  userProject,
}: {
  feature: Feature;
  competitors: Competitor[];
  userProject: UserProject;
}) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-zinc-800/40 hover:bg-gradient-to-r hover:from-zinc-900/40 hover:to-zinc-800/40 transition-all duration-300 group"
    >
      <td className="px-6 py-3 text-left">
        <div className="flex items-center space-x-3">
          <div className="flex h-7 w-7 rounded-lg bg-gradient-to-br from-zinc-800/60 to-zinc-700/60 items-center justify-center border border-zinc-700/40 group-hover:border-zinc-600/60 transition-all duration-300 shadow-sm">
            {getFeatureIcon(feature.icon)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white text-xs leading-tight">
                {feature.name}
              </span>
              <Tooltip content={feature.description}>
                <Info className="h-3 w-3 text-gray-400 hover:text-gray-300 transition-colors cursor-help flex-shrink-0" />
              </Tooltip>
            </div>
          </div>
        </div>
      </td>

      {competitors.map((competitor, index) => (
        <td key={index} className="px-2 py-3 text-center">
          <div className="flex justify-center">
            {competitor.features?.[feature.name] ? (
              <div className="flex h-6 w-6 rounded-full bg-gradient-to-br from-emerald-500/90 to-green-600/90 items-center justify-center shadow-sm shadow-emerald-500/25">
                <CheckIcon className="h-3 w-3 text-white" />
              </div>
            ) : (
              <div className="flex h-6 w-6 rounded-full bg-gradient-to-br from-red-500/90 to-rose-600/90 items-center justify-center shadow-sm shadow-red-500/25">
                <X className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        </td>
      ))}

      <td className="px-2 py-3 text-center">
        <div className="flex justify-center">
          {userProject.features[feature.name] ? (
            <div className="flex h-6 w-6 rounded-full bg-gradient-to-br from-primary2/90 to-darkPrimary/90 items-center justify-center shadow-sm shadow-primary2/25">
              <CheckIcon className="h-3 w-3 text-white" />
            </div>
          ) : (
            <div className="flex h-6 w-6 rounded-full bg-gradient-to-br from-red-500/90 to-rose-600/90 items-center justify-center shadow-sm shadow-red-500/25">
              <X className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
      </td>
    </motion.tr>
  );
}

export function IndustryCompetitors({
  onDataChange,
  isLoading = false,
  comparisonData,
  onRetry,
}: FeatureComparisonMatrixProps) {
  if (!comparisonData && !isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-700/20 to-zinc-600/20 rounded-full blur-xl"></div>
            <Building2 className="relative h-16 w-16 mx-auto opacity-40" />
          </div>
          <div className="space-y-2">
            <p className="text-white font-medium">
              No comparison data available
            </p>
            <p className="text-gray-500 text-sm">
              AI analysis failed or is not yet generated
            </p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-gradient-to-r from-primary2 to-darkPrimary text-white rounded-lg font-medium hover:shadow-lg hover:shadow-primary2/25 transition-all duration-300"
            >
              Retry Analysis
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {isLoading ? (
        <LoadingState />
      ) : comparisonData ? (
        <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-800/90 rounded-2xl border border-zinc-700/40 overflow-hidden shadow-2xl shadow-black/20 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-700/40 bg-gradient-to-r from-zinc-900/95 to-zinc-800/95">
                  <th className="px-6 py-4 text-left text-xs font-bold text-white min-w-60">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 rounded-lg bg-gradient-to-br from-primary2/20 to-darkPrimary/20 items-center justify-center border border-primary2/30">
                        <BarChart3 className="h-3.5 w-3.5 text-primary2" />
                      </div>
                      <span className="text-sm">Features</span>
                    </div>
                  </th>
                  {comparisonData.competitors.map((competitor) => (
                    <th
                      key={competitor.name}
                      className="px-3 py-4 text-center min-w-32"
                    >
                      <div className="space-y-2">
                        {/* Primary: Company Name */}
                        <div className="flex items-center justify-center space-x-1">
                          <span className="text-sm font-bold text-white truncate max-w-28 leading-tight">
                            {competitor.name}
                          </span>
                          {competitor.description && (
                            <Tooltip content={competitor.description}>
                              <Info className="h-3 w-3 text-gray-400 hover:text-gray-300 transition-colors cursor-help flex-shrink-0" />
                            </Tooltip>
                          )}
                        </div>
                        {/* Secondary: Type Badge */}
                        <div className="flex items-center justify-center">
                          <div
                            className={cn(
                              "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border shadow-sm transition-all duration-300",
                              getCompetitorTypeColor(
                                competitor.type || "Niche Player"
                              )
                            )}
                          >
                            <span className="truncate">{competitor.type}</span>
                          </div>
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-4 text-center min-w-32">
                    <div className="space-y-2">
                      {/* Primary: Project Name */}
                      <div className="flex items-center justify-center space-x-1">
                        <span className="text-sm font-bold text-white leading-tight">
                          {comparisonData.userProject.name}
                        </span>
                      </div>
                      {/* Secondary: Project Badge */}
                      <div className="flex items-center justify-center">
                        <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border bg-gradient-to-r from-primary2/15 to-darkPrimary/15 text-primary2 border-primary2/30 shadow-sm">
                          <span>Your Project</span>
                        </div>
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.categories.map((category) => (
                  <React.Fragment key={category.name}>
                    <CategoryHeader
                      category={category}
                      competitorCount={comparisonData.competitors.length}
                    />
                    {category.features.map((feature) => (
                      <FeatureRow
                        key={feature.name}
                        feature={feature}
                        competitors={comparisonData.competitors}
                        userProject={comparisonData.userProject}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Enhanced Summary Footer */}
          <div className="bg-gradient-to-r from-zinc-900/95 to-zinc-800/95 p-4 border-t border-zinc-700/40">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 rounded-lg bg-gradient-to-br from-primary2/20 to-darkPrimary/20 items-center justify-center border border-primary2/30 shadow-sm shadow-primary2/10">
                  <Trophy className="h-4 w-4 text-primary2" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    Competitive Analysis Summary
                  </h4>
                  <p className="text-xs text-gray-400">
                    Comprehensive feature comparison across{" "}
                    {comparisonData.competitors.length} key market competitors
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500/15 to-blue-500/15 border border-cyan-500/30 shadow-sm shadow-cyan-500/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></div>
                  <span className="text-xs font-semibold text-cyan-300">
                    {comparisonData.categories.reduce(
                      (acc, cat) => acc + cat.features.length,
                      0
                    )}{" "}
                    Features
                  </span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-primary2/15 to-darkPrimary/15 border border-primary2/30 shadow-sm shadow-primary2/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary2 shadow-sm shadow-primary2/50"></div>
                  <span className="text-xs font-semibold text-primary2">
                    {comparisonData.categories.length} Categories
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
