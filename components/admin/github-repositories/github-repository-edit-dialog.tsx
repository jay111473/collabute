"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GithubRepository } from "@/types/convex";
import {
  Github,
  Calendar,
  User,
  Star,
  GitFork,
  ExternalLink,
  Lock,
  Unlock,
  Globe,
  Hash,
} from "lucide-react";

interface GithubRepositoryEditDialogProps {
  repository: GithubRepository | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "view" | "edit";
}

export function GithubRepositoryEditDialog({
  repository,
  isOpen,
  onOpenChange,
  mode,
}: GithubRepositoryEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: repository?.name || "",
    description: repository?.description || "",
    isActive: repository?.isActive ?? true,
    private: repository?.private ?? false,
    language: repository?.language || "",
  });

  const updateRepository = useMutation(api.github_repositories.update);

  const handleSave = async () => {
    if (!repository || mode === "view") return;

    setIsLoading(true);
    try {
      await updateRepository({
        id: repository._id,
        ...formData,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update repository:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (repository: GithubRepository) => {
    if (repository.isActive) {
      return (
        <Badge variant="default" className="bg-green-600 text-white">
          Active
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-gray-50 text-gray-700 border-gray-300"
      >
        Inactive
      </Badge>
    );
  };

  const getVisibilityBadge = (isPrivate: boolean) => {
    if (isPrivate) {
      return (
        <Badge variant="destructive" className="bg-red-600 text-white">
          Private
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-green-600 text-white">
        Public
      </Badge>
    );
  };

  const getLanguageBadge = (language: string | undefined) => {
    if (!language)
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-700 border-gray-300"
        >
          N/A
        </Badge>
      );

    const badgeConfig = {
      JavaScript: {
        variant: "default" as const,
        className: "bg-yellow-600 text-white",
      },
      TypeScript: {
        variant: "default" as const,
        className: "bg-blue-600 text-white",
      },
      Python: {
        variant: "default" as const,
        className: "bg-green-600 text-white",
      },
      Java: {
        variant: "secondary" as const,
        className: "bg-orange-100 text-orange-800 border-orange-200",
      },
      "C#": {
        variant: "secondary" as const,
        className: "bg-purple-100 text-purple-800 border-purple-200",
      },
      Go: { variant: "default" as const, className: "bg-cyan-600 text-white" },
      Rust: {
        variant: "destructive" as const,
        className: "bg-red-600 text-white",
      },
      PHP: {
        variant: "secondary" as const,
        className: "bg-indigo-100 text-indigo-800 border-indigo-200",
      },
    };

    const config = badgeConfig[language as keyof typeof badgeConfig] || {
      variant: "outline" as const,
      className: "bg-gray-50 text-gray-700 border-gray-300",
    };

    return (
      <Badge variant={config.variant} className={config.className}>
        {language}
      </Badge>
    );
  };

  if (!repository) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            {mode === "view" ? "Repository Details" : "Edit Repository"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Repository Name</Label>
              {mode === "view" ? (
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                  {repository.name}
                </p>
              ) : (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-white border-gray-300 text-gray-900"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                {repository.fullName}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              {mode === "view" ? (
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border min-h-[60px]">
                  {repository.description || "No description provided"}
                </p>
              ) : (
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-white border-gray-300 text-gray-900 min-h-[60px]"
                  placeholder="Repository description..."
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Primary Language</Label>
                {mode === "view" ? (
                  <div>{getLanguageBadge(repository.language)}</div>
                ) : (
                  <Input
                    id="language"
                    value={formData.language}
                    onChange={(e) =>
                      setFormData({ ...formData, language: e.target.value })
                    }
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="JavaScript, Python, TypeScript..."
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Default Branch</Label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                  {repository.defaultBranch}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Visibility</Label>
                <div className="flex items-center gap-4">
                  <div>{getVisibilityBadge(repository.private)}</div>
                  {mode === "edit" && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="private"
                        checked={formData.private}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, private: checked })
                        }
                      />
                      <Label
                        htmlFor="private"
                        className="flex items-center gap-2"
                      >
                        {formData.private ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <Unlock className="h-4 w-4" />
                        )}
                        Private
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-4">
                  <div>{getStatusBadge(repository)}</div>
                  {mode === "edit" && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isActive: checked })
                        }
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Repository URLs</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <a
                    href={repository.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {repository.htmlUrl}
                  </a>
                  <ExternalLink className="h-3 w-3 text-gray-400" />
                </div>
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-900 font-mono">
                    {repository.cloneUrl}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stars</Label>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <p className="text-lg font-semibold text-gray-900">
                      {repository.stargazersCount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Forks</Label>
                  <div className="flex items-center gap-2">
                    <GitFork className="h-4 w-4 text-gray-500" />
                    <p className="text-lg font-semibold text-gray-900">
                      {repository.forksCount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Repository Statistics</Label>
                <div className="bg-gray-50 p-4 rounded-md border space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">GitHub ID:</span>
                    <span className="text-sm font-mono text-gray-900">
                      #{repository.githubId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stars:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-sm text-gray-900">
                        {repository.stargazersCount}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Forks:</span>
                    <div className="flex items-center gap-1">
                      <GitFork className="h-3 w-3 text-gray-500" />
                      <span className="text-sm text-gray-900">
                        {repository.forksCount}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Language:</span>
                    <div>{getLanguageBadge(repository.language)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Visibility:</span>
                    <div>{getVisibilityBadge(repository.private)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Last Sync</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-900">
                    {new Date(repository.lastSyncAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Owner</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-900 font-mono">
                    {repository.ownerId}
                  </p>
                </div>
              </div>

              {repository.projectId && (
                <div className="space-y-2">
                  <Label>Associated Project</Label>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-900 font-mono">
                      {repository.projectId}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>GitHub Information</Label>
                <div className="bg-gray-50 p-4 rounded-md border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GitHub ID:</span>
                    <span className="text-gray-900 font-mono">
                      #{repository.githubId}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Full Name:</span>
                    <span className="text-gray-900 font-mono">
                      {repository.fullName}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Default Branch:</span>
                    <span className="text-gray-900">
                      {repository.defaultBranch}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Synced:</span>
                    <span className="text-gray-900">
                      {new Date(repository.lastSyncAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Created</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-900">
                    {new Date(repository._creationTime).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Repository ID</Label>
                <p className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded border">
                  {repository._id}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-gray-900"
          >
            {mode === "view" ? "Close" : "Cancel"}
          </Button>
          {mode === "edit" && (
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
