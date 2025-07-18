"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Code, 
  FileText, 
  GitBranch, 
  Star, 
  GitFork, 
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Target,
  Lightbulb
} from "lucide-react";

interface Repository {
  repoId: string;
  name: string;
  fullName: string;
  url: string;
  isPrivate: boolean;
  description?: string;
  language?: string;
  defaultBranch?: string;
  stargazers_count?: number;
  forks_count?: number;
  updated_at?: string;
  created_at?: string;
  size?: number;
  topics?: string[];
}

interface ProjectAnalysis {
  projectName: string;
  projectDescription: string;
  overview: string;
  technologyStack: string[];
  projectType: "web-app" | "mobile-app" | "desktop-app" | "api" | "library" | "cli-tool" | "other";
  keyFeatures: string[];
  architecture: string;
  setupInstructions: string;
  apiEndpoints?: Array<{
    path: string;
    method: string;
    description: string;
  }>;
  dependencies: Array<{
    name: string;
    purpose: string;
  }>;
  complexity: "beginner" | "intermediate" | "advanced";
  developmentStatus: "early-stage" | "active-development" | "stable" | "maintenance";
  targetAudience: string;
  codeQuality: {
    hasTests: boolean;
    hasDocumentation: boolean;
    hasLinting: boolean;
    hasTypeScript: boolean;
    score: number;
  };
  recommendations: string[];
}

interface GitHubRepoAnalyzerProps {
  repository: Repository;
  token: string;
  onAnalysisComplete: (analysis: ProjectAnalysis) => void;
  onBack: () => void;
}

const complexityColors = {
  beginner: "bg-green-500",
  intermediate: "bg-yellow-500",
  advanced: "bg-red-500"
};

const statusColors = {
  "early-stage": "bg-blue-500",
  "active-development": "bg-green-500",
  "stable": "bg-emerald-500",
  "maintenance": "bg-orange-500"
};

const projectTypeIcons = {
  "web-app": "🌐",
  "mobile-app": "📱",
  "desktop-app": "🖥️",
  "api": "🔌",
  "library": "📚",
  "cli-tool": "⚡",
  "other": "📦"
};

export function GitHubRepoAnalyzer({ 
  repository, 
  token, 
  onAnalysisComplete, 
  onBack 
}: GitHubRepoAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState<string>("");

  const analyzeRepository = async () => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisStep("Fetching repository structure...");

    try {
      // Fetch repository structure
      const structureResponse = await fetch(
        `/api/github/repository-structure?repoFullName=${encodeURIComponent(repository.fullName)}&branch=${repository.defaultBranch || "main"}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!structureResponse.ok) {
        throw new Error("Failed to fetch repository structure");
      }

      const structure = await structureResponse.json();
      setAnalysisStep("Analyzing key files...");

      // Fetch key files
      const readmeContent = await fetchFileContent("README.md");
      const packageJsonContent = await fetchFileContent("package.json");
      const dockerfileContent = await fetchFileContent("Dockerfile");
      const composerContent = await fetchFileContent("composer.json");
      const requirementsContent = await fetchFileContent("requirements.txt");
      const cargoContent = await fetchFileContent("Cargo.toml");

      setAnalysisStep("Generating AI analysis...");

      // Prepare data for AI analysis
      const analysisData = {
        readme: readmeContent,
        packageJson: packageJsonContent,
        repoStructure: JSON.stringify(structure, null, 2),
        codeFiles: JSON.stringify({
          dockerfile: dockerfileContent,
          composer: composerContent,
          requirements: requirementsContent,
          cargo: cargoContent
        }, null, 2)
      };

      // Send to AI analysis endpoint
      const analysisResponse = await fetch("/api/wizard-project-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(analysisData),
      });

      if (!analysisResponse.ok) {
        throw new Error("Failed to analyze repository");
      }

      const analysisResult = await analysisResponse.json();
      setAnalysis(analysisResult.object);

    } catch (err) {
      console.error("Error analyzing repository:", err);
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  const fetchFileContent = async (filePath: string): Promise<string | null> => {
    try {
      const response = await fetch(
        `/api/github/file-content?repoFullName=${encodeURIComponent(repository.fullName)}&filePath=${encodeURIComponent(filePath)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.content;
      }
      return null;
    } catch {
      return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <Card className="bg-gradient-to-br from-darkPrimary/20 to-darkPrimary/5 border-white/10 p-8 rounded-2xl max-w-md w-full">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary2/20 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary2" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-white">
                Analyzing Repository
              </h3>
              <p className="text-gray-400">
                {analysisStep || "Preparing analysis..."}
              </p>
            </div>
            <Progress value={analysisStep ? 66 : 33} className="w-full" />
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <Card className="bg-gradient-to-br from-red-900/20 to-red-900/5 border-red-800/30 p-8 rounded-2xl max-w-md w-full">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-white">
                Analysis Failed
              </h3>
              <p className="text-gray-400">{error}</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={analyzeRepository} variant="outline">
                Try Again
              </Button>
              <Button onClick={onBack} variant="secondary">
                Go Back
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <Card className="bg-gradient-to-br from-darkPrimary/20 to-darkPrimary/5 border-white/10 p-8 rounded-2xl max-w-2xl w-full">
          <div className="space-y-6">
            {/* Repository Info */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">
                  {repository.name}
                </h3>
                <p className="text-gray-400">
                  {repository.description || "No description available"}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Code className="h-4 w-4" />
                    {repository.language || "Unknown"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {repository.stargazers_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="h-4 w-4" />
                    {repository.forks_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Updated {formatDate(repository.updated_at!)}
                  </span>
                </div>
              </div>
              <Badge variant={repository.isPrivate ? "destructive" : "secondary"}>
                {repository.isPrivate ? "Private" : "Public"}
              </Badge>
            </div>

            {/* Topics */}
            {repository.topics && repository.topics.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {repository.topics.map((topic) => (
                    <Badge key={topic} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action */}
            <div className="flex justify-center pt-4">
              <Button 
                onClick={analyzeRepository}
                className="bg-primary2 hover:bg-primary2/90 text-white"
                size="lg"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Analyze Repository
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-2xl">{projectTypeIcons[analysis.projectType]}</span>
            {analysis.projectName}
          </h2>
          <p className="text-gray-400">{analysis.projectDescription}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={`${complexityColors[analysis.complexity]} text-white`}>
            {analysis.complexity}
          </Badge>
          <Badge className={`${statusColors[analysis.developmentStatus]} text-white`}>
            {analysis.developmentStatus}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-darkPrimary/10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tech-stack">Tech Stack</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="quality">Code Quality</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-darkPrimary/10 border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Project Overview
            </h3>
            <p className="text-gray-300 leading-relaxed">{analysis.overview}</p>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-darkPrimary/10 border-white/10 p-6">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Target Audience
              </h4>
              <p className="text-gray-300">{analysis.targetAudience}</p>
            </Card>

            <Card className="bg-darkPrimary/10 border-white/10 p-6">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Architecture
              </h4>
              <p className="text-gray-300">{analysis.architecture}</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tech-stack" className="space-y-6">
          <Card className="bg-darkPrimary/10 border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Technology Stack</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.technologyStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-sm">
                  {tech}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="bg-darkPrimary/10 border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Key Dependencies</h3>
            <div className="space-y-3">
              {analysis.dependencies.map((dep, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Badge variant="outline" className="text-xs">
                    {dep.name}
                  </Badge>
                  <span className="text-gray-300 text-sm">{dep.purpose}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card className="bg-darkPrimary/10 border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Key Features</h3>
            <div className="space-y-3">
              {analysis.keyFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </Card>

          {analysis.apiEndpoints && analysis.apiEndpoints.length > 0 && (
            <Card className="bg-darkPrimary/10 border-white/10 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">API Endpoints</h3>
              <div className="space-y-3">
                {analysis.apiEndpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Badge variant="outline" className="text-xs">
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm text-primary2">{endpoint.path}</code>
                    <span className="text-gray-300 text-sm">{endpoint.description}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <Card className="bg-darkPrimary/10 border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Code Quality Assessment</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Overall Score</span>
                <div className="flex items-center gap-2">
                  <Progress value={analysis.codeQuality.score * 10} className="w-32" />
                  <span className="text-white font-semibold">{analysis.codeQuality.score}/10</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  {analysis.codeQuality.hasTests ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  )}
                  <span className="text-gray-300">Tests</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {analysis.codeQuality.hasDocumentation ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  )}
                  <span className="text-gray-300">Documentation</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {analysis.codeQuality.hasLinting ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  )}
                  <span className="text-gray-300">Linting</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {analysis.codeQuality.hasTypeScript ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  )}
                  <span className="text-gray-300">TypeScript</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card className="bg-darkPrimary/10 border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Recommendations
            </h3>
            <div className="space-y-3">
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary2 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-300">{recommendation}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6">
        <Button onClick={onBack} variant="outline">
          Back to Repository Selection
        </Button>
        <Button 
          onClick={() => onAnalysisComplete(analysis)}
          className="bg-primary2 hover:bg-primary2/90 text-white"
          size="lg"
        >
          Use This Analysis
        </Button>
      </div>
    </div>
  );
}