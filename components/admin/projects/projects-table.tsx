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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Project } from "@/types/convex";
import { ProjectEditDialog } from "./project-edit-dialog";
import { Id } from "@/convex/_generated/dataModel";
import { PROJECT_TYPE } from "@/convex/schema";

export function ProjectsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ownerId: "",
    teamLeadId: "",
    type: "" as string,
    status: "PLANNED" as string,
    budget: "",
    isPublic: true,
    repositoryUrl: "",
  });
  const projects = useQuery(api.projects.list, {}) as Project[] | undefined;
  const users = useQuery(api.users.list, {}) as any[] | undefined;
  const createProject = useMutation(api.projects.createProject);

  const filteredProjects = projects?.filter(
    (project) =>
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const badgeConfig = {
      PLANNED: {
        variant: "secondary" as const,
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      IN_PROGRESS: {
        variant: "default" as const,
        className: "bg-green-600 text-white",
      },
      COMPLETED: {
        variant: "outline" as const,
        className: "bg-gray-100 text-gray-800 border-grayBorders",
      },
      ON_HOLD: {
        variant: "destructive" as const,
        className: "bg-red-600 text-white",
      },
    };

    const config = badgeConfig[status as keyof typeof badgeConfig] || {
      variant: "outline" as const,
      className: "bg-darkGray2 text-gray-300 border-grayBorders",
    };

    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatBudget = (budget: number | undefined) => {
    if (!budget) return "N/A";
    return budget.toLocaleString();
  };

  const getOwnerName = (ownerId: string) => {
    const user = users?.find((u) => u._id === ownerId);
    return user?.name || user?.email || "Unknown User";
  };

  const handleCreateProject = async () => {
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.ownerId
    )
      return;

    setIsLoading(true);
    try {
      await createProject({
        title: formData.name.trim(),
        description: formData.description.trim(),
        ownerId: formData.ownerId as any,
        teamLeadId: formData.teamLeadId as Id<"users">,
        type: formData.type as any,
        startDate: Date.now(),
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
      });

      setIsCreateOpen(false);
      setFormData({
        name: "",
        description: "",
        ownerId: "",
        teamLeadId: "",
        type: "",
        status: "PLANNED",
        budget: "",
        isPublic: true,
        repositoryUrl: "",
      });
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setDialogMode("view");
    setIsDetailsOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setDialogMode("edit");
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-darkGray border-grayBorders text-white placeholder-gray-400"
          />
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </div>

      <div className="bg-darkGray border border-grayBorders rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-darkGray2 border-b border-grayBorders">
              <TableHead className="text-gray-300 font-medium px-6 py-4">
                Title
              </TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">
                Status
              </TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">
                Type
              </TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">
                Owner
              </TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">
                Budget
              </TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">
                Start Date
              </TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">
                Stacks
              </TableHead>
              <TableHead className="text-right text-gray-300 font-medium px-6 py-4">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-darkGray">
            {filteredProjects?.map((project) => (
              <TableRow
                key={project._id}
                className="border-b border-grayBorders hover:bg-darkGray2 transition-colors duration-150"
              >
                <TableCell className="px-6 py-4">
                  <div>
                    <div className="font-medium text-white">
                      {project.title}
                    </div>
                    <div className="text-sm text-gray-400 truncate max-w-xs">
                      {project.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  {getStatusBadge(project.status)}
                </TableCell>
                <TableCell className="px-4 py-4">
                  <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                    {project.type?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="text-sm text-gray-300">
                    {getOwnerName(project.ownerId)}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-300">
                    <DollarSign className="h-3 w-3" />
                    {formatBudget(project.budget)}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-300">
                    <Calendar className="h-3 w-3" />
                    {formatDate(project.startDate)}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    {project.stacks?.slice(0, 2).map((stack) => (
                      <Badge
                        key={stack}
                        variant="outline"
                        className="text-xs bg-slate-100 text-slate-700 border-slate-300"
                      >
                        {stack}
                      </Badge>
                    ))}
                    {project.stacks && project.stacks.length > 2 && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-slate-100 text-slate-700 border-slate-300"
                      >
                        +{project.stacks.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-blue-400 hover:bg-darkGray2 transition-colors duration-150"
                      onClick={() => handleViewProject(project)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-amber-400 hover:bg-darkGray2 transition-colors duration-150"
                      onClick={() => handleEditProject(project)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-300 hover:bg-darkGray2 transition-colors duration-150"
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

      {filteredProjects?.length === 0 && (
        <div className="text-center py-8 text-gray-400">No projects found</div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg bg-darkGray border-grayBorders">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Project</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Project Name *</Label>
              <Input
                id="name"
                placeholder="Project title"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-darkGray border-grayBorders text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">Description *</Label>
              <Textarea
                id="description"
                placeholder="Project description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-darkGray border-grayBorders min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerId" className="text-gray-300">Owner *</Label>
                <Select
                  value={formData.ownerId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, ownerId: value })
                  }
                >
                  <SelectTrigger className="bg-darkGray border-grayBorders text-white">
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent className="bg-darkGray border-grayBorders">
                    {users?.map((user) => (
                      <SelectItem key={user._id} value={user._id} className="text-white hover:bg-darkGray2">
                        {user.email || user.name || "Unknown User"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-gray-300">Project Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="bg-darkGray border-grayBorders text-white">
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent className="bg-darkGray border-grayBorders max-h-[300px]">
                    <SelectItem value="frontend" className="text-white hover:bg-darkGray2">Frontend</SelectItem>
                    <SelectItem value="backend" className="text-white hover:bg-darkGray2">Backend</SelectItem>
                    <SelectItem value="devops" className="text-white hover:bg-darkGray2">DevOps</SelectItem>
                    <SelectItem value="mobile" className="text-white hover:bg-darkGray2">Mobile</SelectItem>
                    <SelectItem value="data_analytics" className="text-white hover:bg-darkGray2">Data Analytics</SelectItem>
                    <SelectItem value="ai_ml" className="text-white hover:bg-darkGray2">AI/ML</SelectItem>
                    <SelectItem value="embedded_iot" className="text-white hover:bg-darkGray2">Embedded/IoT</SelectItem>
                    <SelectItem value="desktop" className="text-white hover:bg-darkGray2">Desktop</SelectItem>
                    <SelectItem value="game" className="text-white hover:bg-darkGray2">Game</SelectItem>
                    <SelectItem value="blockchain_web3" className="text-white hover:bg-darkGray2">Blockchain/Web3</SelectItem>
                    <SelectItem value="cloud_infrastructure" className="text-white hover:bg-darkGray2">Cloud Infrastructure</SelectItem>
                    <SelectItem value="security" className="text-white hover:bg-darkGray2">Security</SelectItem>
                    <SelectItem value="database" className="text-white hover:bg-darkGray2">Database</SelectItem>
                    <SelectItem value="api_integration" className="text-white hover:bg-darkGray2">API Integration</SelectItem>
                    <SelectItem value="ar_vr" className="text-white hover:bg-darkGray2">AR/VR</SelectItem>
                    <SelectItem value="audio_video" className="text-white hover:bg-darkGray2">Audio/Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamLeadId" className="text-gray-300">Team Lead</Label>
              <Select
                value={formData.teamLeadId || "none"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    teamLeadId: value === "none" ? "" : value,
                  })
                }
              >
                <SelectTrigger className="bg-darkGray border-grayBorders text-white">
                  <SelectValue placeholder="Select team lead (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-darkGray border-grayBorders">
                  <SelectItem value="none" className="text-white hover:bg-darkGray2">No team lead</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user._id} value={user._id} className="text-white hover:bg-darkGray2">
                      {user.email || user.name || "Unknown User"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget" className="text-gray-300">Budget</Label>
              <Input
                id="budget"
                type="number"
                placeholder="10000"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
                className="bg-darkGray border-grayBorders text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repositoryUrl" className="text-gray-300">Repository URL</Label>
              <Input
                id="repositoryUrl"
                placeholder="https://github.com/user/repo"
                value={formData.repositoryUrl}
                onChange={(e) =>
                  setFormData({ ...formData, repositoryUrl: e.target.value })
                }
                className="bg-darkGray border-grayBorders text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPublic: checked })
                }
              />
              <Label htmlFor="isPublic" className="text-gray-300">Public</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isLoading}
              className="text-white bg-darkGray border-grayBorders hover:bg-darkGray2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={
                !formData.name.trim() ||
                !formData.description.trim() ||
                !formData.ownerId ||
                !formData.type ||
                isLoading
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProjectEditDialog
        project={selectedProject}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        mode={dialogMode}
      />
    </div>
  );
}
