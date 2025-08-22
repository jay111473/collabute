"use client";

import { Database, Monitor, Palette, Globe, TestTube } from "lucide-react";

interface ProjectTypeCountsProps {
  typeCounts: {
    "Back-end": number;
    "Front-end": number;
    "QA / Test": number;
    Deployment: number;
    Design: number;
  };
}

const ProjectTypeCounts = ({ typeCounts }: ProjectTypeCountsProps) => {
  const typeConfigs = [
    {
      label: "Back-end",
      count: typeCounts["Back-end"],
      icon: <Database className="w-6 h-6 text-purple-400" />,
    },
    {
      label: "Front-end",
      count: typeCounts["Front-end"],
      icon: <Monitor className="w-6 h-6 text-purple-400" />,
    },
    {
      label: "QA / Test",
      count: typeCounts["QA / Test"],
      icon: <TestTube className="w-6 h-6 text-purple-400" />,
    },
    {
      label: "Deployment",
      count: typeCounts["Deployment"],
      icon: <Globe className="w-6 h-6 text-purple-400" />,
    },
    {
      label: "Design",
      count: typeCounts["Design"],
      icon: <Palette className="w-6 h-6 text-purple-400" />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-medium text-white">Projects</h2>
      <div className="flex gap-4">
        {typeConfigs.map((type) => (
          <div
            key={type.label}
            className="flex flex-col items-start justify-center w-44 h-25 p-4 rounded-xl 
                       bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] 
                       border border-white/10 shadow-sm hover:border-purple-500/30 
                       transition-colors cursor-pointer gap-y-2"
          >
            <div>{type.icon}</div>

            <div className="flex gap-2.5 items-center">
              <span className="text-white font-semibold">{type.label}</span>
              <span className="text-purple-400 font-medium tabular-nums">
                {type.count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectTypeCounts;
