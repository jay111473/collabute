import { cn } from "@/lib/utils";
import {
  Loader2,
  CheckIcon,
  ExternalLink,
  Building2,
  Users,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

// Add CSS for line clamping
const lineClampStyles = `
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
`;

interface Industry {
  label: string;
  value: string;
}

interface Competitor {
  name: string;
  url: string;
  slogan?: string;
  yearFounded?: number;
  businessScale?: "Startup" | "SMB" | "Enterprise" | "Global Enterprise";
  marketShare?: {
    percentage: number;
    region: string;
  };
  description?: string;
}

interface IndustryCompetitorsProps {
  projectInfo: {
    name: string;
    description: string;
    industries: string[];
    projectPlatforms: { value: string; isCore?: boolean }[];
  };
  onIndustriesChange: (industries: string[]) => void;
  onCompetitorsChange: (competitors: Competitor[]) => void;
  isLoading?: boolean;
  suggestedIndustries: Industry[];
  suggestedCompetitors: Competitor[];
  selectedIndustries: string[];
  selectedCompetitors: Competitor[];
}

function LoadingState() {
  return (
    <div className="flex items-center gap-2 text-primary2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">
        AI is analyzing your project and finding competitors...
      </span>
    </div>
  );
}

function IndustryCard({
  industry,
  isSelected,
  onToggle,
}: {
  industry: Industry;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all",
        isSelected
          ? "bg-blue-500/20 border border-blue-500/40"
          : "bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700"
      )}
      onClick={onToggle}
    >
      <div
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors",
          isSelected ? "border-blue-500 bg-blue-500" : "border-zinc-600"
        )}
      >
        {isSelected && <CheckIcon className="h-2.5 w-2.5 text-white" />}
      </div>
      <span
        className={cn(
          "font-medium text-sm",
          isSelected ? "text-blue-100" : "text-gray-300"
        )}
      >
        {industry.label}
      </span>
    </motion.div>
  );
}

function CompetitorCard({
  competitor,
  isSelected,
  onToggle,
}: {
  competitor: Competitor;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const getScaleColor = (scale?: string) => {
    switch (scale) {
      case "Startup":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "SMB":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "Enterprise":
        return "bg-violet-500/10 text-violet-400 border-violet-500/20";
      case "Global Enterprise":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={cn(
        "group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2",
        isSelected
          ? "border-purple-500/50 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent shadow-lg shadow-purple-500/10"
          : "border-zinc-800/50 bg-gradient-to-br from-zinc-900/50 via-zinc-900/30 to-transparent hover:border-zinc-700/50 hover:shadow-lg hover:shadow-black/20"
      )}
      onClick={onToggle}
    >
      {/* Selection indicator - top right corner */}
      <div className="absolute top-3 right-3 z-10">
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-200",
            isSelected
              ? "border-purple-500 bg-purple-500 shadow-lg shadow-purple-500/30"
              : "border-zinc-600 group-hover:border-zinc-500"
          )}
        >
          {isSelected && <CheckIcon className="h-3.5 w-3.5 text-white" />}
        </div>
      </div>

      {/* Company avatar and header */}
      <div className="flex items-start space-x-4 mb-4">
        <div
          className={cn(
            "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200",
            isSelected
              ? "bg-gradient-to-br from-purple-500/20 to-purple-600/20 text-purple-300 border border-purple-500/30"
              : "bg-gradient-to-br from-zinc-700/50 to-zinc-800/50 text-zinc-400 border border-zinc-700/50"
          )}
        >
          {getInitials(competitor.name)}
        </div>
        <div className="flex-grow min-w-0 pt-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3
              className={cn(
                "font-semibold truncate transition-colors duration-200",
                isSelected ? "text-purple-100" : "text-white"
              )}
            >
              {competitor.name}
            </h3>
            <a
              href={competitor.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex-shrink-0 transition-colors duration-200",
                isSelected
                  ? "text-purple-400 hover:text-purple-300"
                  : "text-zinc-400 hover:text-zinc-300"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          {competitor.slogan && (
            <p
              className={cn(
                "text-xs italic line-clamp-1 transition-colors duration-200",
                isSelected ? "text-purple-300/80" : "text-zinc-400"
              )}
            >
              &quot;{competitor.slogan}&quot;
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      {competitor.description && (
        <p
          className={cn(
            "text-sm mb-4 line-clamp-2 transition-colors duration-200",
            isSelected ? "text-purple-200/90" : "text-zinc-300"
          )}
        >
          {competitor.description}
        </p>
      )}

      {/* Metadata tags */}
      <div className="flex flex-wrap gap-2">
        {competitor.yearFounded && (
          <span
            className={cn(
              "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border transition-colors duration-200",
              isSelected
                ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                : "bg-zinc-800/50 text-zinc-400 border-zinc-700/50"
            )}
          >
            Est. {competitor.yearFounded}
          </span>
        )}

        {competitor.businessScale && (
          <span
            className={cn(
              "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border transition-colors duration-200",
              isSelected
                ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                : getScaleColor(competitor.businessScale)
            )}
          >
            {competitor.businessScale}
          </span>
        )}

        {competitor.marketShare && (
          <span
            className={cn(
              "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border transition-colors duration-200",
              isSelected
                ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            )}
          >
            {competitor.marketShare.percentage}% {competitor.marketShare.region}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function IndustryCompetitors({
  projectInfo,
  onIndustriesChange,
  onCompetitorsChange,
  isLoading = false,
  suggestedIndustries,
  suggestedCompetitors,
  selectedIndustries,
  selectedCompetitors,
}: IndustryCompetitorsProps) {
  const toggleIndustry = (industryValue: string) => {
    const isSelected = selectedIndustries.includes(industryValue);
    if (isSelected) {
      onIndustriesChange(selectedIndustries.filter((i) => i !== industryValue));
    } else {
      onIndustriesChange([...selectedIndustries, industryValue]);
    }
  };

  const toggleCompetitor = (competitor: Competitor) => {
    const isSelected = selectedCompetitors.some(
      (c) => c.name === competitor.name
    );
    if (isSelected) {
      onCompetitorsChange(
        selectedCompetitors.filter((c) => c.name !== competitor.name)
      );
    } else {
      onCompetitorsChange([...selectedCompetitors, competitor]);
    }
  };

  return (
    <div className="relative min-h-[500px] flex flex-col items-center justify-center">
      {/* Add style tag for line clamping */}
      <style dangerouslySetInnerHTML={{ __html: lineClampStyles }} />
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-6 space-y-2">
          <h2 className="text-2xl font-bold text-white">
            Industries & Market Analysis
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm">
            We&apos;ve analyzed your project and identified relevant industries
            and key competitors. Review and select the ones that align with your
            vision.
          </p>
        </div>

        <div className="group h-full">
          <div className="relative h-full">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-darkPrimary/20 to-primary/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-5 bg-black rounded-xl space-y-6 h-full flex flex-col">
              {isLoading ? (
                <div className="flex items-center justify-center py-16 h-full">
                  <LoadingState />
                </div>
              ) : (
                <div className="space-y-10 flex-grow">
                  {/* Industries Section - Minimal Pills */}
                  <div className="bg-gradient-to-r from-blue-500/5 to-cyan-500/5 p-6 rounded-2xl border border-blue-500/10">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="flex h-8 w-8 rounded-xl bg-blue-500/20 items-center justify-center">
                        <Building2 className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Target Industries
                        </h3>
                        <p className="text-sm text-blue-200/60">
                          Select relevant industry categories
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {suggestedIndustries.map((industry) => (
                        <IndustryCard
                          key={industry.value}
                          industry={industry}
                          isSelected={selectedIndustries.includes(
                            industry.value
                          )}
                          onToggle={() => toggleIndustry(industry.value)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Competitors Section - Rich Cards */}
                  <div className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 p-6 rounded-2xl border border-purple-500/10">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="flex h-8 w-8 rounded-xl bg-purple-500/20 items-center justify-center">
                        <Users className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Key Competitors
                        </h3>
                        <p className="text-sm text-purple-200/60">
                          Companies in your competitive landscape
                        </p>
                      </div>
                    </div>

                    {suggestedCompetitors.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {suggestedCompetitors.map((competitor) => (
                          <CompetitorCard
                            key={competitor.name}
                            competitor={competitor}
                            isSelected={selectedCompetitors.some(
                              (c) => c.name === competitor.name
                            )}
                            onToggle={() => toggleCompetitor(competitor)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
                          <Building2 className="h-8 w-8 opacity-50" />
                        </div>
                        <p className="text-lg font-medium mb-2">
                          No competitors found
                        </p>
                        <p className="text-sm text-gray-500">
                          We couldn&apos;t identify direct competitors for your
                          project yet.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Summary Footer */}
              {!isLoading &&
                (suggestedIndustries.length > 0 ||
                  suggestedCompetitors.length > 0) && (
                  <div className="bg-gradient-to-r from-zinc-900/80 to-zinc-800/80 p-5 rounded-2xl border border-zinc-700/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 rounded-xl bg-gradient-to-br from-darkPrimary/20 to-primary/20 items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-darkPrimary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-1">
                            Market Analysis Summary
                          </h4>
                          <p className="text-xs text-gray-400">
                            Your competitive landscape overview
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {selectedIndustries.length > 0 && (
                          <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            <span className="text-xs font-medium text-blue-300">
                              {selectedIndustries.length}{" "}
                              {selectedIndustries.length === 1
                                ? "Industry"
                                : "Industries"}
                            </span>
                          </div>
                        )}
                        {selectedCompetitors.length > 0 && (
                          <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                            <span className="text-xs font-medium text-purple-300">
                              {selectedCompetitors.length}{" "}
                              {selectedCompetitors.length === 1
                                ? "Competitor"
                                : "Competitors"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
