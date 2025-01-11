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

  // Group features by phase
  const featuresByPhase = features.reduce((acc, feature) => {
    if (!acc[feature.phase]) {
      acc[feature.phase] = [];
    }
    acc[feature.phase].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

  // Calculate totals for each phase
  const phaseTotals = Object.entries(featuresByPhase).reduce((acc, [phase, phaseFeatures]) => {
    acc[phase] = {
      totalTime: phaseFeatures.reduce((sum, f) => {
        const weeks = parseInt(f.estimatedTimeline.split(' ')[0]);
        return sum + weeks;
      }, 0),
      totalPrice: phaseFeatures.reduce((sum, f) => sum + f.estimatedPrice, 0),
    };
    return acc;
  }, {} as Record<string, { totalTime: number; totalPrice: number }>);

  const handleTimelineChange = (feature: Feature, newTimeline: string) => {
    const updatedFeatures = features.map(f => 
      f.title === feature.title ? { ...f, estimatedTimeline: newTimeline } : f
    );
    onFeaturesChange(updatedFeatures);
  };

  const phaseOrder: Record<string, number> = {
    alpha: 1,
    beta: 2,
    production: 3,
  };

  const sortedPhases = Object.keys(featuresByPhase).sort(
    (a, b) => phaseOrder[a] - phaseOrder[b]
  );

  return (
    <div className="w-full space-y-8 text-white">
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="text-sm text-white/60">Review your project timeline</p>
          <h2 className="text-3xl font-semibold tracking-tight">Feature Timeline</h2>
          <p className="text-base text-white/60">
            Review and adjust the estimated timeline for each feature. These estimates will be validated
            by your Technical Product Manager.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {sortedPhases.map((phase) => (
          <div key={phase} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-medium capitalize">{phase} Phase</h3>
              <div className="flex items-center gap-6 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4" />
                  <span>{phaseTotals[phase].totalTime} weeks</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSignIcon className="h-4 w-4" />
                  <span>${phaseTotals[phase].totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {featuresByPhase[phase].map((feature) => (
                <div
                  key={feature.title}
                  className="group relative p-6 rounded-xl transition-all duration-300 bg-black/40 backdrop-blur-sm border border-white/5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-medium">{feature.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          feature.complexity === 'high' 
                            ? 'bg-red-500/10 text-red-500'
                            : feature.complexity === 'medium'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-green-500/10 text-green-500'
                        }`}>
                          {feature.complexity}
                        </span>
                      </div>
                      <p className="text-sm text-white/60">{feature.description}</p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-white/60" />
                        <Select
                          value={feature.estimatedTimeline}
                          onValueChange={(value) => handleTimelineChange(feature, value)}
                        >
                          <SelectTrigger className="w-[120px] bg-transparent border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3 days">3 days</SelectItem>
                            <SelectItem value="1 week">1 week</SelectItem>
                            <SelectItem value="2 weeks">2 weeks</SelectItem>
                            <SelectItem value="3 weeks">3 weeks</SelectItem>
                            <SelectItem value="4 weeks">4 weeks</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <DollarSignIcon className="h-4 w-4 text-white/60" />
                        <span className="text-sm">${feature.estimatedPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between p-6 rounded-xl bg-primary2/5 border border-primary2/20">
        <div className="space-y-1">
          <h3 className="font-medium">Total Project Timeline</h3>
          <p className="text-sm text-white/60">Estimated completion time for all phases</p>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-white/60" />
            <span>
              {Object.values(phaseTotals).reduce((sum, { totalTime }) => sum + totalTime, 0)} weeks
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSignIcon className="h-4 w-4 text-white/60" />
            <span>
              ${Object.values(phaseTotals)
                .reduce((sum, { totalPrice }) => sum + totalPrice, 0)
                .toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 