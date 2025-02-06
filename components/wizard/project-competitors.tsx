import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ProjectInfo } from "@/types/wizard";
import { ChevronDown } from "lucide-react";

interface Competitor {
  name: string;
  url: string;
  swot?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

interface ProjectCompetitorsProps {
  projectInfo: ProjectInfo;
  competitors: Competitor[];
  onCompetitorsChange: (competitors: Competitor[]) => void;
  isLoading: boolean;
  suggestedCompetitors: Competitor[];
}

export function ProjectCompetitors({
  projectInfo,
  competitors,
  onCompetitorsChange,
  isLoading,
  suggestedCompetitors,
}: ProjectCompetitorsProps) {
  console.log("ProjectCompetitors Props:", {
    projectInfo,
    competitors,
    isLoading,
    suggestedCompetitors,
  });

  const [showCompetitors, setShowCompetitors] = useState(false);
  const [selectedCompetitors, setSelectedCompetitors] = useState<Competitor[]>(
    []
  );
  const [activeCompetitor, setActiveCompetitor] = useState<Competitor | null>(
    null
  );

  useEffect(() => {
    console.log("suggestedCompetitors changed:", suggestedCompetitors);
    if (suggestedCompetitors.length > 0) {
      setShowCompetitors(true);
      setSelectedCompetitors(suggestedCompetitors);
      onCompetitorsChange(suggestedCompetitors);
    }
  }, [suggestedCompetitors, onCompetitorsChange]);

  useEffect(() => {
    console.log("competitors changed:", competitors);
    if (competitors.length > 0) {
      setShowCompetitors(true);
      setSelectedCompetitors(competitors);
    }
  }, [competitors]);

  useEffect(() => {
    console.log("State Update:", {
      showCompetitors,
      selectedCompetitors,
      activeCompetitor,
    });
  }, [showCompetitors, selectedCompetitors, activeCompetitor]);

  const handleCompetitorSelect = (competitor: Competitor) => {
    if (activeCompetitor?.name === competitor.name) {
      setActiveCompetitor(null);
      return;
    }
    setActiveCompetitor(competitor);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  const renderSwotAnalysis = (competitor: Competitor) => {
    if (!competitor.swot) return null;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="grid grid-cols-2 gap-4 mt-4"
      >
        <div className="space-y-2">
          <h4 className="text-primary2 font-medium">Strengths</h4>
          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
            {competitor.swot.strengths.map((strength, i) => (
              <li key={i}>{strength}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="text-red-400 font-medium">Weaknesses</h4>
          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
            {competitor.swot.weaknesses.map((weakness, i) => (
              <li key={i}>{weakness}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="text-green-400 font-medium">Opportunities</h4>
          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
            {competitor.swot.opportunities.map((opportunity, i) => (
              <li key={i}>{opportunity}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="text-yellow-400 font-medium">Threats</h4>
          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
            {competitor.swot.threats.map((threat, i) => (
              <li key={i}>{threat}</li>
            ))}
          </ul>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative min-h-[600px] flex items-center justify-center">
      <AnimatePresence>
        {(showCompetitors || selectedCompetitors.length > 0) && (
          <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="w-full max-w-4xl mx-auto space-y-8"
          >
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">Market Analysis</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                We&apos;ve analyzed your market and identified key competitors.
                Click on each competitor to see their detailed SWOT analysis.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {selectedCompetitors.map((competitor) => (
                <motion.div
                  key={competitor.name}
                  variants={item}
                  whileHover={{ scale: 1.01 }}
                  className={cn(
                    "relative group cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300",
                    "bg-gradient-to-br from-darkPrimary/20 to-darkPrimary/5",
                    activeCompetitor?.name === competitor.name
                      ? "border-primary2"
                      : "border-white/10 hover:border-white/20"
                  )}
                  onClick={() => handleCompetitorSelect(competitor)}
                >
                  {/* Glow Effect */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-2xl transition-opacity duration-300",
                      "bg-gradient-to-r from-primary2/20 to-primary/20 blur-xl",
                      activeCompetitor?.name === competitor.name
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-50"
                    )}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {competitor.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <a
                          href={competitor.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "px-4 py-1.5 rounded-lg text-sm flex items-center gap-2",
                            "bg-primary2/10 hover:bg-primary2/20 text-primary2",
                            "transition-colors duration-200"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Visit Website <span className="text-xs">→</span>
                        </a>
                        <ChevronDown
                          className={cn(
                            "w-5 h-5 text-gray-400 transition-transform duration-200 ml-4",
                            activeCompetitor?.name === competitor.name &&
                              "transform rotate-180"
                          )}
                        />
                      </div>
                    </div>

                    {activeCompetitor?.name === competitor.name &&
                      renderSwotAnalysis(competitor)}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Loading Animation */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm"
        >
          <div className="relative">
            {/* Main glow */}
            <div className="absolute inset-0 rounded-full bg-primary2/20 blur-3xl animate-pulse" />

            {/* Orbiting dots */}
            <div className="relative w-32 h-32">
              <motion.div
                className="absolute w-3 h-3 bg-primary2 rounded-full"
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ transformOrigin: "16px 16px" }}
              />
              <motion.div
                className="absolute w-3 h-3 bg-primary2/80 rounded-full"
                animate={{
                  rotate: -360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  transformOrigin: "16px 16px",
                  left: "50%",
                  top: "50%",
                }}
              />
            </div>

            {/* Loading text */}
            <div className="text-center mt-8">
              <p className="text-white text-lg font-medium">Analyzing Market</p>
              <p className="text-gray-400 text-sm">
                Identifying key competitors...
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
