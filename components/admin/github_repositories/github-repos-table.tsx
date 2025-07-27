"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Github,
  Star,
  GitFork,
  Lock,
  Unlock,
  ExternalLink,
} from "lucide-react";
import { GithubRepositoryEditDialog } from "../github-repositories/github-repository-edit-dialog";
import { GithubRepository } from "@/types/convex";

export function GitHubReposTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRepository, setSelectedRepository] =
    useState<GithubRepository | null>(null);
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    fullName: "",
    description: "",
    ownerId: "",
    private: false,
    htmlUrl: "",
    cloneUrl: "",
    language: "",
    stargazersCount: 0,
    forksCount: 0,
    defaultBranch: "main",
    isActive: true,
    projectId: "",
    githubId: 0,
  });

  const repositories = useQuery(api["github_repositories"].list, {}) as
    | GithubRepository[]
    | undefined;
  const createRepository = useMutation(api["github_repositories"].create);

  const filteredRepositories = repositories?.filter(
    (repo) =>
      repo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.language?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge
        variant={isActive ? "default" : "destructive"}
        className={
          isActive ? "bg-green-600 text-white" : "bg-gray-600 text-white"
        }
      >
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  const getVisibilityBadge = (isPrivate: boolean) => {
    if (isPrivate) {
      return (
        <Badge variant="destructive" className="bg-red-600 text-white">
          <Lock className="h-3 w-3 mr-1" />
          Private
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-green-600 text-white">
        <Unlock className="h-3 w-3 mr-1" />
        Public
      </Badge>
    );
  };

  const getLanguageBadge = (language?: string) => {
    if (!language)
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-500 border-gray-200"
        >
          N/A
        </Badge>
      );

    const languageColors: Record<string, string> = {
      TypeScript: "bg-blue-100 text-blue-800 border-blue-200",
      JavaScript: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Python: "bg-green-100 text-green-800 border-green-200",
      Java: "bg-red-100 text-red-800 border-red-200",
      Go: "bg-cyan-100 text-cyan-800 border-cyan-200",
      Rust: "bg-orange-100 text-orange-800 border-orange-200",
    };

    const colorClass =
      languageColors[language] || "bg-gray-100 text-gray-700 border-gray-300";

    return (
      <Badge variant="outline" className={`text-xs ${colorClass}`}>
        {language}
      </Badge>
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const handleViewRepository = (repository: GithubRepository) => {
    setSelectedRepository(repository);
    setDialogMode("view");
    setIsDetailsOpen(true);
  };

  const handleEditRepository = (repository: GithubRepository) => {
    setSelectedRepository(repository);
    setDialogMode("edit");
    setIsDetailsOpen(true);
  };

  const handleCreateRepository = async () => {
    if (
      !formData.name.trim() ||
      !formData.fullName.trim() ||
      !formData.ownerId.trim() ||
      !formData.htmlUrl.trim() ||
      !formData.cloneUrl.trim()
    )
      return;

    setIsLoading(true);
    try {
      await createRepository({
        githubId: formData.githubId,
        name: formData.name.trim(),
        fullName: formData.fullName.trim(),
        description: formData.description.trim() || undefined,
        ownerId: formData.ownerId.trim() as any,
        private: formData.private,
        htmlUrl: formData.htmlUrl.trim(),
        cloneUrl: formData.cloneUrl.trim(),
        language: formData.language.trim() || undefined,
        stargazersCount: formData.stargazersCount,
        forksCount: formData.forksCount,
        defaultBranch: formData.defaultBranch,
        isActive: formData.isActive,
        lastSyncAt: Date.now(),
        projectId: formData.projectId.trim()
          ? (formData.projectId.trim() as any)
          : undefined,
      });

      setIsCreateOpen(false);
      setFormData({
        name: "",
        fullName: "",
        description: "",
        ownerId: "",
        private: false,
        htmlUrl: "",
        cloneUrl: "",
        language: "",
        stargazersCount: 0,
        forksCount: 0,
        defaultBranch: "main",
        isActive: true,
        projectId: "",
        githubId: 0,
      });
    } catch (error) {
      console.error("Failed to create repository:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Github className="h-4 w-4" />
            {filteredRepositories?.length || 0} repositories
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Repository
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="text-gray-700 font-medium px-6 py-4">
                Repository
              </TableHead>
              <TableHead className="text-gray-700 font-medium px-4 py-4">
                Visibility
              </TableHead>
              <TableHead className="text-gray-700 font-medium px-4 py-4">
                Language
              </TableHead>
              <TableHead className="text-gray-700 font-medium px-4 py-4">
                Stats
              </TableHead>
              <TableHead className="text-gray-700 font-medium px-4 py-4">
                Status
              </TableHead>
              <TableHead className="text-gray-700 font-medium px-4 py-4">
                Last Sync
              </TableHead>
              <TableHead className="text-right text-gray-700 font-medium px-6 py-4">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {filteredRepositories?.map((repo) => (
              <TableRow
                key={repo._id}
                className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150"
              >
                <TableCell className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <Github className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900">
                          {repo.name}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                          onClick={() => window.open(repo.htmlUrl, "_blank")}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-sm text-gray-500">
                        {repo.fullName}
                      </div>
                      {repo.description && (
                        <div className="text-sm text-gray-600 mt-1 max-w-xs truncate">
                          {repo.description}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  {getVisibilityBadge(repo.private)}
                </TableCell>
                <TableCell className="px-4 py-4">
                  {getLanguageBadge(repo.language)}
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {formatNumber(repo.stargazersCount)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <GitFork className="h-3 w-3 text-gray-400" />
                      {formatNumber(repo.forksCount)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  {getStatusBadge(repo.isActive)}
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="text-sm text-gray-700">
                    {formatDate(repo.lastSyncAt)}
                  </div>
                </TableCell>
                <TableCell className="text-right px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-blue-700 hover:bg-blue-100 transition-colors duration-150"
                      onClick={() => handleViewRepository(repo)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-amber-700 hover:bg-amber-100 transition-colors duration-150"
                      onClick={() => handleEditRepository(repo)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-100 transition-colors duration-150"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredRepositories?.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No repositories found
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Repository</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="githubId">GitHub ID</Label>
              <Input
                id="githubId"
                type="number"
                placeholder="GitHub repository ID"
                value={formData.githubId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    githubId: parseInt(e.target.value) || 0,
                  })
                }
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Repository Name</Label>
              <Input
                id="name"
                placeholder="e.g., my-project"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="e.g., username/my-project"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Repository description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-white border-gray-300 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerId">Owner ID</Label>
              <Input
                id="ownerId"
                placeholder="Repository owner user ID"
                value={formData.ownerId}
                onChange={(e) =>
                  setFormData({ ...formData, ownerId: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="htmlUrl">HTML URL</Label>
              <Input
                id="htmlUrl"
                placeholder="https://github.com/username/repo"
                value={formData.htmlUrl}
                onChange={(e) =>
                  setFormData({ ...formData, htmlUrl: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cloneUrl">Clone URL</Label>
              <Input
                id="cloneUrl"
                placeholder="https://github.com/username/repo.git"
                value={formData.cloneUrl}
                onChange={(e) =>
                  setFormData({ ...formData, cloneUrl: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                placeholder="e.g., TypeScript, JavaScript"
                value={formData.language}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stargazersCount">Stars</Label>
                <Input
                  id="stargazersCount"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stargazersCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stargazersCount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="forksCount">Forks</Label>
                <Input
                  id="forksCount"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.forksCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      forksCount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultBranch">Default Branch</Label>
              <Input
                id="defaultBranch"
                placeholder="main"
                value={formData.defaultBranch}
                onChange={(e) =>
                  setFormData({ ...formData, defaultBranch: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectId">Linked Project ID (Optional)</Label>
              <Input
                id="projectId"
                placeholder="Project ID to link"
                value={formData.projectId}
                onChange={(e) =>
                  setFormData({ ...formData, projectId: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="private"
                checked={formData.private}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, private: checked })
                }
              />
              <Label htmlFor="private">Private Repository</Label>
            </div>

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
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRepository}
              disabled={
                !formData.name.trim() ||
                !formData.fullName.trim() ||
                !formData.ownerId.trim() ||
                !formData.htmlUrl.trim() ||
                !formData.cloneUrl.trim() ||
                isLoading
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Creating..." : "Create Repository"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GithubRepositoryEditDialog
        repository={selectedRepository}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        mode={dialogMode}
      />
    </div>
  );
}
