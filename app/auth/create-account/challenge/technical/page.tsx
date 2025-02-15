"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Clock } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useUser } from "@/app/providers/UserContext";

interface TestCase {
  input: string;
  expectedOutput: string;
  description: string;
}

interface TechnicalChallenge {
  title: string;
  difficulty: "easy" | "medium" | "hard";
  timeEstimate: number;
  context: string;
  requirements: string[];
  codeTemplate: {
    language: string;
    template: string;
    emptySection: {
      startLine: number;
      endLine: number;
      description: string;
    };
  };
  testCases: TestCase[];
  hints: string[];
  evaluation: {
    criteria: string[];
    scoringRubric: Array<{
      aspect: string;
      points: number;
      description: string;
    }>;
  };
}

interface ProgressHeaderProps {
  timeEstimate: number;
  timeLeft: number;
}

interface ChallengeSubmission {
  languages: string[];
  categories: string[];
  timeManagement: {
    selectedOption: string;
    analysis: {
      style: "agile" | "structured" | "flexible" | "deadline-driven";
      strengths: string[];
      weaknesses: string[];
      recommendation: string;
    };
  };
  technical: {
    challenge: {
      title: string;
      difficulty: string;
      timeEstimate: number;
    };
    solution: {
      code: string;
      challengeId: string;
      submittedAt: string;
      timeSpent: number;
    };
  };
}

const ProgressHeader = ({ timeEstimate, timeLeft }: ProgressHeaderProps) => {
  const progress = Math.max(0, (timeLeft / (timeEstimate * 60)) * 100);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="border-b border-zinc-800 bg-black/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto py-4 px-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute -inset-2 bg-primary/10 rounded-full blur-md group-hover:bg-primary/20 transition-all duration-300" />
                <Image
                  src="/logo.svg"
                  alt="logo"
                  width={40}
                  height={40}
                  className="relative"
                />
              </div>
              <div className="h-6 w-px bg-zinc-800" />
              <p className="text-sm text-zinc-400">Step 3 of 3</p>
            </div>
            <div className="flex items-center gap-3 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
              <Clock className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-zinc-300">
                {formatTime(timeLeft)} remaining
              </span>
            </div>
          </div>
          <div className="w-full h-1 bg-zinc-900/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                boxShadow: "0 0 20px rgba(var(--primary), 0.5)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TechnicalChallenge() {
  const router = useRouter();
  const { userId } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [challenge, setChallenge] = useState<TechnicalChallenge | null>(null);
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Load the pre-generated challenge from localStorage
    const savedChallenge = localStorage.getItem("technicalChallenge");
    if (!savedChallenge) {
      router.push("/auth/create-account/challenge/time-management");
      return;
    }

    try {
      const data = JSON.parse(savedChallenge);
      setChallenge(data.challenge);
      setCode(data.challenge.codeTemplate.template);
      // Initialize timer with challenge time in seconds
      setTimeLeft(data.challenge.timeEstimate * 60);
    } catch (err) {
      console.error("Failed to parse challenge:", err);
      setError("Failed to load the challenge. Please try again.");
    }
  }, [router]);

  // Timer effect
  useEffect(() => {
    if (!timeLeft || !challenge) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, challenge]);

  const handleEditorChange = (value: string | undefined) => {
    if (value) setCode(value);
  };

  const handleSubmit = async () => {
    if (!userId) {
      setError("User session not found. Please try signing up again.");
      return;
    }

    if (!challenge) {
      setError("Challenge data not found. Please try again.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get all the challenge data
      const languages = JSON.parse(
        localStorage.getItem("selectedLanguages") || "[]"
      );
      const categories = JSON.parse(
        localStorage.getItem("selectedCategories") || "[]"
      );
      const timeManagement = JSON.parse(
        localStorage.getItem("timeManagementAnswer") || "{}"
      );

      const challengeData: ChallengeSubmission = {
        languages,
        categories,
        timeManagement,
        technical: {
          challenge: {
            title: challenge.title,
            difficulty: challenge.difficulty,
            timeEstimate: challenge.timeEstimate,
          },
          solution: {
            code,
            challengeId: challenge.title,
            submittedAt: new Date().toISOString(),
            timeSpent: challenge.timeEstimate * 60 - timeLeft,
          },
        },
      };

      // Submit to backend
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengeSubmission: challengeData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit challenge");
      }

      // Navigate to completion
      router.push("/auth/create-account/challenge/complete");
    } catch (error) {
      console.error("Failed to submit challenge:", error);
      setError("Failed to submit your solution. Please try again.");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-gray-400">Generating your challenge...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <p className="text-red-500">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-gray-400">Loading challenge...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
      <ProgressHeader
        timeEstimate={challenge.timeEstimate}
        timeLeft={timeLeft}
      />

      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="space-y-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/10 rounded-full blur-lg opacity-75" />
              <Image
                src="/logo.svg"
                alt="logo"
                width={80}
                height={80}
                className="relative"
              />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
                Technical Challenge
              </h1>
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-primary/80" />
                  <span className="text-sm font-medium text-zinc-300">
                    {challenge.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
                  <Clock className="w-4 h-4 text-primary/80" />
                  <span className="text-sm font-medium text-zinc-300">
                    {challenge.timeEstimate} mins
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side - Challenge description */}
            <div className="space-y-6">
              <Card className="p-8 bg-black/50 border-zinc-800/50 backdrop-blur-sm">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">
                      {challenge.title}
                    </h2>
                    <p className="text-zinc-300 leading-relaxed">
                      {challenge.context}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Requirements
                    </h3>
                    <ul className="space-y-3">
                      {challenge.requirements.map((req, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-zinc-300"
                        >
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm text-primary">
                            {index + 1}
                          </span>
                          <span className="mt-0.5">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Test Cases
                    </h3>
                    <div className="space-y-4">
                      {challenge.testCases.map((test, index) => (
                        <div key={index} className="space-y-2">
                          <p className="text-sm text-zinc-400">
                            {test.description}
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <div className="text-xs text-zinc-500 uppercase tracking-wider">
                                Input
                              </div>
                              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
                                <code className="text-sm text-zinc-300 font-mono">
                                  {test.input}
                                </code>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <div className="text-xs text-zinc-500 uppercase tracking-wider">
                                Expected
                              </div>
                              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
                                <code className="text-sm text-zinc-300 font-mono">
                                  {test.expectedOutput}
                                </code>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Button
                      variant="outline"
                      onClick={() => setShowHints(!showHints)}
                      className="w-full bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:text-primary transition-all duration-200"
                    >
                      <div className="flex items-center justify-center gap-2">
                        {showHints ? "Hide Hints" : "Show Hints"}
                      </div>
                    </Button>

                    {showHints && (
                      <div className="mt-4 space-y-3">
                        <h3 className="text-lg font-semibold text-white">
                          Hints
                        </h3>
                        <ul className="space-y-2">
                          {challenge.hints.map((hint, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-3 text-zinc-300"
                            >
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm text-primary">
                                {index + 1}
                              </span>
                              <span className="mt-0.5">{hint}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Right side - Code editor */}
            <div className="space-y-6">
              <div className="h-[600px] rounded-lg overflow-hidden border-2 border-zinc-800/50 bg-black/30 backdrop-blur-sm">
                <Editor
                  height="100%"
                  defaultLanguage={challenge.codeTemplate.language}
                  defaultValue={challenge.codeTemplate.template}
                  theme="vs-dark"
                  onChange={handleEditorChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 20 },
                  }}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.back()}
                  className="min-w-[140px] bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 transition-all duration-200"
                >
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  className="min-w-[140px] bg-primary hover:bg-primary/90 text-white transition-all duration-200"
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
