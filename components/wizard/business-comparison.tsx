import React from "react";
import { cn } from "@/lib/utils";
import {
  Loader2,
  CheckIcon,
  X,
  Trophy,
  Rocket,
  Building2,
  DollarSign,
  Target,
  Info,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  BusinessAspect,
  BusinessCategory,
  BusinessCompetitor,
  UserBusinessProject,
  BusinessComparisonData,
} from "@/types/wizard";

interface BusinessComparisonProps {
  onDataChange?: (data: BusinessComparisonData) => void;
  isLoading?: boolean;
  comparisonData?: BusinessComparisonData;
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
          <p className="text-white font-medium">
            AI is analyzing business models
          </p>
          <p className="text-gray-400 text-sm">
            Generating comprehensive business comparison...
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

function getBusinessIcon(iconName: string) {
  const IconComponent = (LucideIcons as any)[iconName] || DollarSign;
  return <IconComponent className="h-4 w-4 text-zinc-300" />;
}

function BusinessCategoryHeader({
  category,
  competitorCount,
}: {
  category: BusinessCategory;
  competitorCount: number;
}) {
  return (
    <tr>
      <td
        colSpan={competitorCount + 2}
        className="px-8 py-4 bg-gradient-to-r from-zinc-900/95 to-zinc-800/95 border-b border-zinc-700/30"
      >
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-primary2 to-darkPrimary shadow-lg shadow-primary2/30"></div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            {category.name}
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-zinc-700/50 to-transparent"></div>
          <span className="text-xs text-gray-400 font-medium">
            {category.features.length} aspects
          </span>
        </div>
      </td>
    </tr>
  );
}

function BusinessAspectRow({
  aspect,
  competitors,
  userProject,
}: {
  aspect: BusinessAspect;
  competitors: BusinessCompetitor[];
  userProject: UserBusinessProject;
}) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-zinc-800/40 hover:bg-gradient-to-r hover:from-zinc-900/40 hover:to-zinc-800/40 transition-all duration-300 group"
    >
      <td className="px-8 py-6 text-left">
        <div className="flex items-center space-x-4">
          <div className="flex h-11 w-11 rounded-xl bg-gradient-to-br from-zinc-800/60 to-zinc-700/60 items-center justify-center border border-zinc-700/40 group-hover:border-zinc-600/60 transition-all duration-300 shadow-lg">
            {getBusinessIcon(aspect.icon)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm leading-tight">
                {aspect.name}
              </span>
              <Tooltip content={aspect.description}>
                <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-300 transition-colors cursor-help flex-shrink-0" />
              </Tooltip>
            </div>
          </div>
        </div>
      </td>

      {competitors.map((competitor) => (
        <td key={competitor.name} className="px-3 py-6 text-center">
          <div className="flex justify-center">
            {competitor.features[aspect.name] ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/25 to-green-500/25 border border-emerald-500/50 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300"
              >
                <CheckIcon className="h-4 w-4 text-emerald-300" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/40 shadow-lg shadow-red-500/15 hover:shadow-red-500/25 transition-all duration-300"
              >
                <X className="h-3.5 w-3.5 text-red-300" />
              </motion.div>
            )}
          </div>
        </td>
      ))}

      <td className="px-3 py-6 text-center">
        <div className="flex justify-center">
          {userProject.features[aspect.name] ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary2/25 to-darkPrimary/25 border border-primary2/50 shadow-lg shadow-primary2/20 hover:shadow-primary2/30 transition-all duration-300"
            >
              <CheckIcon className="h-4 w-4 text-primary2" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/40 shadow-lg shadow-red-500/15 hover:shadow-red-500/25 transition-all duration-300"
            >
              <X className="h-3.5 w-3.5 text-red-300" />
            </motion.div>
          )}
        </div>
      </td>
    </motion.tr>
  );
}

export function BusinessComparison({
  onDataChange,
  isLoading = false,
  comparisonData,
  onRetry,
}: BusinessComparisonProps) {
  if (!comparisonData && !isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-700/20 to-zinc-600/20 rounded-full blur-xl"></div>
            <TrendingUp className="relative h-16 w-16 mx-auto opacity-40" />
          </div>
          <div className="space-y-2">
            <p className="text-white font-medium">
              No business comparison data available
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
                  <th className="px-8 py-8 text-left text-sm font-bold text-white min-w-80">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 rounded-xl bg-gradient-to-br from-primary2/20 to-darkPrimary/20 items-center justify-center border border-primary2/30">
                        <TrendingUp className="h-5 w-5 text-primary2" />
                      </div>
                      <span className="text-base">Business Aspects</span>
                    </div>
                  </th>
                  {comparisonData.competitors.map((competitor) => (
                    <th
                      key={competitor.name}
                      className="px-4 py-8 text-center min-w-40"
                    >
                      <div className="space-y-3">
                        {/* Primary: Company Name */}
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-lg font-bold text-white truncate max-w-36 leading-tight">
                            {competitor.name}
                          </span>
                          <Tooltip content={competitor.description}>
                            <Info className="h-4 w-4 text-gray-400 hover:text-gray-300 transition-colors cursor-help flex-shrink-0" />
                          </Tooltip>
                        </div>
                        {/* Secondary: Type Badge */}
                        <div className="flex items-center justify-center">
                          <div
                            className={cn(
                              "inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium border shadow-sm transition-all duration-300",
                              getCompetitorTypeColor(competitor.type)
                            )}
                          >
                            <span className="truncate">{competitor.type}</span>
                          </div>
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-8 text-center min-w-40">
                    <div className="space-y-3">
                      {/* Primary: Project Name */}
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-lg font-bold text-white leading-tight">
                          {comparisonData.userProject.name}
                        </span>
                      </div>
                      {/* Secondary: Project Badge */}
                      <div className="flex items-center justify-center">
                        <div className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium border bg-gradient-to-r from-primary2/15 to-darkPrimary/15 text-primary2 border-primary2/30 shadow-sm">
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
                    <BusinessCategoryHeader
                      category={category}
                      competitorCount={comparisonData.competitors.length}
                    />
                    {category.features.map((aspect) => (
                      <BusinessAspectRow
                        key={aspect.name}
                        aspect={aspect}
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
          <div className="bg-gradient-to-r from-zinc-900/95 to-zinc-800/95 p-8 border-t border-zinc-700/40">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center space-x-5">
                <div className="flex h-14 w-14 rounded-xl bg-gradient-to-br from-primary2/20 to-darkPrimary/20 items-center justify-center border border-primary2/30 shadow-lg shadow-primary2/10">
                  <TrendingUp className="h-7 w-7 text-primary2" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-2">
                    Business Strategy Analysis
                  </h4>
                  <p className="text-sm text-gray-400">
                    Business model comparison across{" "}
                    {comparisonData.competitors.length} key market competitors
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-3 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500/15 to-blue-500/15 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"></div>
                  <span className="text-sm font-semibold text-cyan-300">
                    {comparisonData.categories.reduce(
                      (acc, cat) => acc + cat.features.length,
                      0
                    )}{" "}
                    Aspects
                  </span>
                </div>
                <div className="flex items-center space-x-3 px-5 py-3 rounded-xl bg-gradient-to-r from-primary2/15 to-darkPrimary/15 border border-primary2/30 shadow-lg shadow-primary2/10">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary2 shadow-lg shadow-primary2/50"></div>
                  <span className="text-sm font-semibold text-primary2">
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
