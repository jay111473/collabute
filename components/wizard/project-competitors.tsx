import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, TrendingUp, Building2, Calendar, X, ExternalLink, AlertTriangle, Info, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Competitor {
  name: string;
  url: string;
  slogan?: string;
  yearFounded?: number;
  businessScale?: 'Startup' | 'SMB' | 'Enterprise' | 'Global Enterprise';
  marketShare?: {
    percentage: number;
    region: string;
  };
  description?: string;
  swot?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

interface ProjectCompetitorsProps {
  projectInfo: {
    name: string;
    description: string;
    industries: string[];
  };
  competitors: Competitor[];
  onCompetitorsChange: (competitors: Competitor[]) => void;
  isLoading?: boolean;
  suggestedCompetitors: Competitor[];
}

function CompetitorCard({ competitor, onRemove }: { competitor: Competitor; onRemove: () => void }) {
  const getScaleColor = (scale?: string) => {
    switch (scale) {
      case 'Startup': return 'text-emerald-500';
      case 'SMB': return 'text-blue-500';
      case 'Enterprise': return 'text-purple-500';
      case 'Global Enterprise': return 'text-amber-500';
      default: return 'text-gray-500';
    }
  };

  const getScaleDescription = (scale: string) => {
    switch (scale) {
      case 'Startup': return 'Early-stage company, typically less than 5 years old with under 100 employees';
      case 'SMB': return 'Small to Medium Business, typically 100-999 employees';
      case 'Enterprise': return 'Large established company, typically 1,000-9,999 employees';
      case 'Global Enterprise': return 'Major international corporation, typically 10,000+ employees worldwide';
      default: return '';
    }
  };

  return (
    <Card className="relative group bg-[#141414] border border-zinc-800 hover:border-darkPrimary/50 transition-all duration-200">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <a
          href={competitor.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-darkPrimary/10 border border-darkPrimary/20 text-darkPrimary hover:bg-darkPrimary/20 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
        <button
          onClick={onRemove}
          className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">
              {competitor.name}
            </h3>
            {competitor.description && (
              <p className="text-base text-zinc-400 leading-relaxed">
                {competitor.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {competitor.yearFounded && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-zinc-500" />
                <span className="text-sm text-zinc-400">
                  Founded in {competitor.yearFounded}
                </span>
              </div>
            )}
            
            {competitor.businessScale && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-zinc-500" />
                <span className={cn("text-sm", getScaleColor(competitor.businessScale))}>
                  {competitor.businessScale}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-zinc-500 hover:text-zinc-400 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-zinc-900 border-zinc-800">
                      <p className="text-sm text-zinc-300">
                        {getScaleDescription(competitor.businessScale)}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </div>

        {competitor.marketShare && (
          <div className="flex items-center gap-4 pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-500">
                {competitor.marketShare.percentage}% Market Share
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-zinc-500" />
              <span className="text-sm text-zinc-400">
                {competitor.marketShare.region}
              </span>
            </div>
          </div>
        )}

        {competitor.swot && (
          <div className="pt-4 border-t border-zinc-800">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-emerald-500">Strengths</h4>
                <ul className="space-y-1">
                  {competitor.swot.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-zinc-400">
                      • {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-500">Weaknesses</h4>
                <ul className="space-y-1">
                  {competitor.swot.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-sm text-zinc-400">
                      • {weakness}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-blue-500">Opportunities</h4>
                <ul className="space-y-1">
                  {competitor.swot.opportunities.map((opportunity, index) => (
                    <li key={index} className="text-sm text-zinc-400">
                      • {opportunity}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-amber-500">Threats</h4>
                <ul className="space-y-1">
                  {competitor.swot.threats.map((threat, index) => (
                    <li key={index} className="text-sm text-zinc-400">
                      • {threat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export function ProjectCompetitors({
  projectInfo,
  competitors,
  onCompetitorsChange,
  isLoading,
  suggestedCompetitors,
}: ProjectCompetitorsProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Market Analysis</h2>
        <p className="text-gray-400">
          Let&apos;s analyze your competitors to understand the market landscape and identify opportunities.
        </p>
        <div className="flex items-center gap-2 bg-amber-950/30 border border-amber-500/20 rounded-lg px-4 py-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <p className="text-sm text-amber-500">This data is AI-generated and may not be 100% accurate</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-darkPrimary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {competitors.map((competitor, index) => (
              <CompetitorCard
                key={index}
                competitor={competitor}
                onRemove={() => onCompetitorsChange(competitors.filter((_, i) => i !== index))}
              />
            ))}
          </div>

          <Card className="bg-zinc-900/30 border-zinc-800 border-dashed">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <Plus className="h-6 w-6 text-zinc-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-zinc-300">Add Your Own Competitors</h3>
                <p className="text-sm text-zinc-500 max-w-md mx-auto">
                  Coming soon! You&apos;ll be able to manually add and track your competitors. Stay tuned for updates.
                </p>
              </div>
              <Badge variant="outline" className="bg-zinc-900/50 text-zinc-500 border-zinc-700">
                Coming Soon
              </Badge>
            </div>
          </Card>

          {competitors.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">
                No competitors found. We&apos;ll analyze your market and suggest relevant competitors.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
