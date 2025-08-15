"use client";

import type { EnhancedProject } from "@/types/convex";
import { FolderOpen } from "lucide-react";

interface ProjectsPaymentOverviewProps {
  projects: EnhancedProject[] | undefined;
}

export const ProjectsPaymentOverview = ({
  projects,
}: ProjectsPaymentOverviewProps) => {
  if (!projects || projects.length === 0) {
    return null;
  }

  const getProjectPaymentData = (project: EnhancedProject) => {
    const budget = project.budget || 0;
    const paidAmount = project.spent || 0;
    const remainingAmount = budget - paidAmount;
    const progressPercentage = budget ? (paidAmount / budget) * 100 : 0;

    return {
      paidAmount,
      remainingAmount,
      progressPercentage,
    };
  };

  return (
    <div className="w-full">
      <h3 className="text-[17px] font-semibold text-white mb-3">
        Based on Projects
      </h3>
      <div className="flex flex-col gap-3">
        {projects.map((project) => {
          const { paidAmount, remainingAmount, progressPercentage } =
            getProjectPaymentData(project);

          return (
            <div
              key={project._id}
              className="w-full bg-[#111111] flex items-center justify-between rounded-xl px-5 py-5"
            >
              <div className="flex items-center gap-3 min-w-[220px]">
                <div className="w-9 h-9 rounded-lg bg-[#201C2A] flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-[#B097F8]" />
                </div>
                <span className="text-white text-[15px] font-medium">
                  {project.title}
                </span>
              </div>

              <div className="flex items-center gap-x-2">
                <div className="flex items-center gap-x-2">
                  <div className="flex items-center gap-2 text-[14px]">
                    <span className="text-[#9CA3AF]">Dedicated amount:</span>
                    <span className="text-white font-bold">
                      ${project.budget?.toLocaleString() || 0}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <div className="w-[90px] h-[6px] bg-[#2E2E2E] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#9F7AEA] to-[#7C3AED]"
                        style={{
                          width: `${Math.min(progressPercentage, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 justify-center text-[14px]">
                    <span className="text-[#9CA3AF]">
                      ${paidAmount.toLocaleString()} paid
                    </span>
                  </div>
                </div>

                <div className="w-0.5 h-[20px] bg-[#2E2E2E]" />

                <div className="flex items-center gap-2 justify-center text-[14px]">
                  <span className="text-[#9CA3AF]">Remaining</span>
                  <span className="text-[#34D399] font-medium">
                    ${remainingAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-end ml-2">
                  <button className="px-4 py-[6px] bg-[#1E1E1E] hover:bg-[#2C2C2C] text-white text-[14px] rounded-lg border border-[#2C2C2C] transition">
                    Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
