import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, StarIcon, DollarSignIcon, HashIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Feature } from "@/types/wizard";

interface ProjectTimelineProps {
  features: Feature[];
  onFeaturesChange: (features: Feature[]) => void;
}

export function ProjectTimeline({ features, onFeaturesChange }: ProjectTimelineProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>(features);

  // Group features by platform
  const featuresByPlatform = features.reduce((acc, feature) => {
    if (!acc[feature.platform]) {
      acc[feature.platform] = [];
    }
    acc[feature.platform].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

  // Platform display names
  const platformNames: Record<string, string> = {
    website: "Website",
    ios: "iOS App",
    android: "Android App",
    desktop: "Desktop App",
    ai: "AI Integration"
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">MVP Feature Overview</h2>
        <p className="text-sm text-white/60">
          Review the features included in your MVP across different platforms.
        </p>
      </div>

      {Object.entries(featuresByPlatform).map(([platform, platformFeatures]) => {
        // Count core features for this platform
        const coreFeatures = platformFeatures.filter(f => f.isCore).length;
        
        // Sort features by order
        const sortedFeatures = [...platformFeatures].sort((a, b) => {
          const orderA = a.order !== undefined ? a.order : Number.MAX_SAFE_INTEGER;
          const orderB = b.order !== undefined ? b.order : Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        });
        
        return (
          <div key={platform} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">
                {platformNames[platform] || platform}
              </h3>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <Badge
                  variant="outline"
                  className="text-xs bg-zinc-800/50 text-zinc-400 border-zinc-700"
                >
                  {platformFeatures.length} feature{platformFeatures.length !== 1 ? "s" : ""}
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

            <div className="space-y-4">
              {sortedFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 border border-zinc-800"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 mr-2">
                        <HashIcon className="h-3.5 w-3.5 text-white/60" />
                        <span className="text-xs text-white/60">{feature.order}</span>
                      </div>
                      <h4 className="text-sm font-medium text-white">{feature.title}</h4>
                      {feature.isCore && (
                        <StarIcon className="h-4 w-4 text-darkPrimary" />
                      )}
                    </div>
                    <p className="text-sm text-white/60">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="mt-8 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">Feature Summary</h3>
            <p className="text-sm text-white/60">Overview of your MVP features</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <StarIcon className="h-5 w-5 text-darkPrimary" />
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {features.filter(f => f.isCore).length} core features
                </p>
                <p className="text-xs text-white/60">Essential functionality</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {features.length} total features
              </p>
              <p className="text-xs text-white/60">Complete MVP scope</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 