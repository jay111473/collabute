import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type ProjectType = "existing" | "new";

interface ProjectTypeProps {
  onProjectTypeChange: (type: ProjectType) => void;
  selectedType?: ProjectType | null;
}

export function ProjectType({
  onProjectTypeChange,
  selectedType,
}: ProjectTypeProps) {
  return (
    <div className="relative min-h-[600px] flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">What type of project do you have?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Let us know if you're bringing an existing project or starting a new idea.
          </p>
        </div>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Existing Project */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={cn(
              "relative group cursor-pointer p-8 rounded-2xl border-2 transition-all duration-300",
              "bg-gradient-to-br from-darkPrimary/20 to-darkPrimary/5 flex flex-col items-center justify-center min-h-[220px]",
              selectedType === "existing" ? "border-primary2" : "border-white/10 hover:border-white/20"
            )}
            onClick={() => onProjectTypeChange("existing")}
          >
            {/* Glow Effect */}
            <div className={cn(
              "absolute inset-0 rounded-2xl transition-opacity duration-300",
              "bg-gradient-to-r from-primary2/20 to-primary/20 blur-xl",
              selectedType === "existing" ? "opacity-100" : "opacity-0 group-hover:opacity-50"
            )} />

            {/* Content */}
            <div className="relative z-10 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary2/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white">Existing Project</h3>
              <p className="text-gray-400">
                I already have a project that is in development or launched.
              </p>
            </div>

            {/* Selection Indicator */}
            <div className={cn(
              "absolute top-4 right-4 text-primary2",
              selectedType === "existing" ? "opacity-100" : "opacity-0"
            )}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </motion.div>

          {/* New Project */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={cn(
              "relative group cursor-pointer p-8 rounded-2xl border-2 transition-all duration-300",
              "bg-gradient-to-br from-darkPrimary/20 to-darkPrimary/5 flex flex-col items-center justify-center min-h-[220px]",
              selectedType === "new" ? "border-primary2" : "border-white/10 hover:border-white/20"
            )}
            onClick={() => onProjectTypeChange("new")}
          >
            {/* Glow Effect */}
            <div className={cn(
              "absolute inset-0 rounded-2xl transition-opacity duration-300",
              "bg-gradient-to-r from-primary2/20 to-primary/20 blur-xl",
              selectedType === "new" ? "opacity-100" : "opacity-0 group-hover:opacity-50"
            )} />

            {/* Content */}
            <div className="relative z-10 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary2/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white">New Idea</h3>
              <p className="text-gray-400">
                I have a new idea or concept that I want to build from scratch.
              </p>
            </div>

            {/* Selection Indicator */}
            <div className={cn(
              "absolute top-4 right-4 text-primary2",
              selectedType === "new" ? "opacity-100" : "opacity-0"
            )}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 