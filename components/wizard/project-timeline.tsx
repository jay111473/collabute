import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, ClockIcon, DollarSignIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  // Calculate totals for each platform
  const platformTotals = Object.entries(featuresByPlatform).reduce((acc, [platform, platformFeatures]) => {
    acc[platform] = {
      totalTime: platformFeatures.reduce((sum, f) => {
        const weeks = parseInt(f.estimatedTimeline.split(' ')[0]);
        return sum + weeks;
      }, 0),
      totalPrice: platformFeatures.reduce((sum, f) => {
        return sum + (typeof f.estimatedPrice === 'number' ? f.estimatedPrice : 0);
      }, 0),
    };
    return acc;
  }, {} as Record<string, { totalTime: number; totalPrice: number }>);

  const handleTimelineChange = (feature: Feature, newTimeline: string) => {
    const updatedFeatures = features.map(f => 
      f.title === feature.title ? { ...f, estimatedTimeline: newTimeline } : f
    );
    onFeaturesChange(updatedFeatures);
  };

  // Platform display names
  const platformNames: Record<string, string> = {
    web: "Web Application",
    mobile: "Mobile App",
    desktop: "Desktop Software",
    ai: "AI Features"
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">MVP Timeline Overview</h2>
        <p className="text-sm text-white/60">
          Review the development timeline for your MVP features across different platforms.
        </p>
      </div>

      {Object.entries(featuresByPlatform).map(([platform, platformFeatures]) => (
        <div key={platform} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">
              {platformNames[platform] || platform}
            </h3>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                {platformTotals[platform].totalTime} weeks
              </div>
              <div className="flex items-center gap-2">
                <DollarSignIcon className="h-4 w-4" />
                ${platformTotals[platform].totalPrice.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {platformFeatures.map((feature) => (
              <div
                key={feature.title}
                className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 border border-zinc-800"
              >
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-white">{feature.title}</h4>
                  <p className="text-sm text-white/60">{feature.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Select
                    value={feature.estimatedTimeline}
                    onValueChange={(value) => handleTimelineChange(feature, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 week">1 week</SelectItem>
                      <SelectItem value="2 weeks">2 weeks</SelectItem>
                      <SelectItem value="3 weeks">3 weeks</SelectItem>
                      <SelectItem value="4 weeks">4 weeks</SelectItem>
                      <SelectItem value="6 weeks">6 weeks</SelectItem>
                      <SelectItem value="8 weeks">8 weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-8 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">Total MVP Timeline</h3>
            <p className="text-sm text-white/60">Estimated total development time and cost</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-primary2" />
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {Object.values(platformTotals).reduce((sum, { totalTime }) => sum + totalTime, 0)} weeks
                </p>
                <p className="text-xs text-white/60">Total Duration</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSignIcon className="h-5 w-5 text-primary2" />
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  ${Object.values(platformTotals).reduce((sum, { totalPrice }) => sum + totalPrice, 0).toLocaleString()}
                </p>
                <p className="text-xs text-white/60">Total Cost</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 