"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2, Clock, CheckCircle2, AlertCircle } from "lucide-react";

// Types
interface TimeManagementStyle {
  style: "agile" | "structured" | "flexible" | "deadline-driven";
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

interface TimeManagementOption {
  id: string;
  text: string;
  analysis: TimeManagementStyle;
}

interface TimeManagementScenario {
  context: string;
  question: string;
  options: TimeManagementOption[];
}

// Components
const ProgressHeader = () => (
  <div className="border-b border-zinc-800 bg-black sticky top-0 z-10">
    <div className="max-w-4xl mx-auto py-4 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="logo" width={40} height={40} />
          <div className="h-6 w-px bg-zinc-800" />
          <p className="text-sm text-zinc-400">Step 2 of 3</p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm text-zinc-400">
            Time Management Challenge
          </span>
        </div>
      </div>
    </div>
  </div>
);

interface ScenarioCardProps {
  context: string;
  question: string;
}

const ScenarioCard = ({ context, question }: ScenarioCardProps) => (
  <section className="space-y-2">
    <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
      Scenario
    </h2>
    <Card className="p-8 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-primary/10 border border-primary/20">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-4">
            <p className="text-lg text-gray-300 leading-relaxed">{context}</p>
            <p className="text-xl font-medium text-white">{question}</p>
          </div>
        </div>
      </div>
    </Card>
  </section>
);

interface OptionCardProps {
  option: TimeManagementOption;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const OptionCard = ({
  option,
  index,
  isSelected,
  onSelect,
}: OptionCardProps) => (
  <Card
    className={cn(
      "relative p-6 cursor-pointer transition-all duration-200 group",
      "hover:bg-zinc-900/70 hover:border-primary/50 hover:shadow-lg",
      isSelected
        ? "border-2 border-primary bg-zinc-900/70 shadow-lg shadow-primary/10"
        : "border border-zinc-800 bg-zinc-900/30"
    )}
    onClick={() => onSelect(option.id)}
  >
    <div className="flex items-start gap-4">
      <div className="flex items-center justify-center w-8 h-8">
        {isSelected ? (
          <CheckCircle2 className="w-6 h-6 text-primary" />
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-zinc-700 group-hover:border-primary/50 flex items-center justify-center">
            <span className="text-sm text-zinc-500 group-hover:text-primary/50">
              {index + 1}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1">
        <p className="text-lg text-gray-200 group-hover:text-white transition-colors">
          {option.text}
        </p>
      </div>
    </div>
  </Card>
);

interface NavigationProps {
  isLoading: boolean;
  canContinue: boolean;
  onBack: () => void;
  onContinue: () => void;
}

const Navigation = ({
  isLoading,
  canContinue,
  onBack,
  onContinue,
}: NavigationProps) => (
  <div className="flex justify-between items-center pt-6 border-t border-zinc-800">
    <Button
      variant="outline"
      size="lg"
      onClick={onBack}
      disabled={isLoading}
      className="min-w-[140px] border-zinc-800 bg-black/50 text-white hover:bg-zinc-900 hover:text-white backdrop-blur-sm"
    >
      Back
    </Button>
    <Button
      size="lg"
      disabled={!canContinue || isLoading}
      onClick={onContinue}
      className={cn(
        "min-w-[140px] text-white relative overflow-hidden",
        canContinue && !isLoading
          ? "bg-primary hover:bg-primary/90"
          : "bg-zinc-800 text-zinc-500"
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <span>Continue</span>
      )}
    </Button>
  </div>
);

// Main Component
export default function TimeManagementChallenge() {
  const router = useRouter();
  const [scenario, setScenario] = useState<TimeManagementScenario | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved scenario on mount
  useEffect(() => {
    const loadSavedScenario = () => {
      const savedScenario = localStorage.getItem("timeManagementScenario");
      if (!savedScenario) {
        router.push("/auth/create-account/challenge/category");
        return;
      }

      try {
        const parsed = JSON.parse(savedScenario);
        setScenario(parsed.scenario);
      } catch (err) {
        console.error("Failed to parse scenario:", err);
        router.push("/auth/create-account/challenge/category");
      }
    };

    loadSavedScenario();
  }, [router]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setError(null);
  };

  const handleContinue = async () => {
    if (!selectedOption || !scenario) return;

    try {
      setIsLoading(true);
      setError(null);

      // Generate technical challenge before navigation
      const languages = JSON.parse(localStorage.getItem("selectedLanguages") || "[]");
      const categories = JSON.parse(localStorage.getItem("selectedCategories") || "[]");
      
      // Save time management answer
      const selectedAnalysis = scenario.options.find(opt => opt.id === selectedOption)?.analysis;
      localStorage.setItem("timeManagementAnswer", JSON.stringify({
        selectedOption,
        analysis: selectedAnalysis
      }));

      // Generate technical challenge
      const response = await fetch("/api/challenge/technical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          languages,
          categories,
          timeManagementStyle: selectedAnalysis?.style
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate technical challenge");
      }

      const data = await response.json();
      
      // Save technical challenge data
      localStorage.setItem("technicalChallenge", JSON.stringify(data));

      // Only navigate after we have the data
      router.push("/auth/create-account/challenge/technical");
    } catch (error) {
      console.error("Failed to generate technical challenge:", error);
      setError("Failed to generate the technical challenge. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!scenario) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-gray-400">Loading challenge...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <ProgressHeader />

      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="space-y-10">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-medium text-white">
              How Do You Handle Complex Priorities?
            </h1>
            <p className="text-lg font-light text-gray-400 max-w-2xl mx-auto">
              Consider the following scenario carefully and choose the approach
              that best matches your development style.
            </p>
          </div>

          <ScenarioCard
            context={scenario.context}
            question={scenario.question}
          />

          <section className="space-y-4">
            <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
              Choose Your Approach
            </h2>
            <div className="grid gap-4">
              {scenario.options.map((option, index) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  index={index}
                  isSelected={selectedOption === option.id}
                  onSelect={handleOptionSelect}
                />
              ))}
            </div>
          </section>

          {error && (
            <div className="flex items-center justify-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-500">{error}</p>
            </div>
          )}

          <Navigation
            isLoading={isLoading}
            canContinue={!!selectedOption}
            onBack={() => router.back()}
            onContinue={handleContinue}
          />
        </div>
      </div>
    </div>
  );
}
