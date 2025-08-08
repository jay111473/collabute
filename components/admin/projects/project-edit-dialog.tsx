"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project } from "@/types/convex";
import {
  Calendar,
  DollarSign,
  FolderOpen,
  GitBranch,
  Users,
  Globe,
  Mail,
  CircleDot,
  PlayCircle,
  CheckCircle,
  Pause,
  XCircle,
} from "lucide-react";

interface ProjectEditDialogProps {
  project: Project | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "view" | "edit";
}

export function ProjectEditDialog({
  project,
  isOpen,
  onOpenChange,
  mode,
}: ProjectEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: project?.title || "",
    description: project?.description || "",
    status: project?.status || "PLANNED",
    budget: project?.budget || 0,
    isPublic: project?.isPublic ?? true,
    stacks: project?.stacks || [],
  });

  // Fetch data for dropdowns
  const techStacks = useQuery(api.tech_stacks.list, { isActive: true });
  const ownerUser = useQuery(
    api.users.getUserProfile,
    project?.ownerId ? { authUserId: project.ownerId } : "skip"
  );
  const teamLeadUser = useQuery(
    api.users.getUserProfile,
    project?.teamLeadId ? { authUserId: project.teamLeadId } : "skip"
  );

  const updateProject = useMutation(api.projects.updateProject);

  // Update form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || "",
        description: project.description || "",
        status: project.status || "PLANNED",
        budget: project.budget || 0,
        isPublic: project.isPublic ?? true,
        stacks: project.stacks || [],
      });
    }
  }, [project]);

  const handleSave = async () => {
    if (!project || mode === "view") return;

    setIsLoading(true);
    try {
      await updateProject({
        projectId: project._id,
        updates: {
          ...formData,
          status: formData.status as any,
        },
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function for status icons
  const getProjectStatusIcon = (status: string | undefined) => {
    if (!status) return <CircleDot className="h-4 w-4 text-gray-400" />;

    const iconMap = {
      planned: { icon: CircleDot, className: "text-blue-500" },
      in_progress: { icon: PlayCircle, className: "text-yellow-500" },
      completed: { icon: CheckCircle, className: "text-green-500" },
      on_hold: { icon: Pause, className: "text-orange-500" },
      cancelled: { icon: XCircle, className: "text-red-500" },
    };

    const normalizedStatus = status.toLowerCase();
    const config = iconMap[normalizedStatus as keyof typeof iconMap] || {
      icon: CircleDot,
      className: "text-gray-400",
    };
    const IconComponent = config.icon;

    return <IconComponent className={`h-4 w-4 ${config.className}`} />;
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status)
      return (
        <Badge
          variant="outline"
          className="bg-darkGray2 text-gray-300 border-grayBorders"
        >
          N/A
        </Badge>
      );

    const badgeConfig = {
      PLANNED: {
        variant: "outline" as const,
        className: "bg-blue-50 text-blue-700 border-blue-300",
      },
      IN_PROGRESS: {
        variant: "default" as const,
        className: "bg-yellow-600 text-white",
      },
      COMPLETED: {
        variant: "default" as const,
        className: "bg-green-600 text-white",
      },
      ON_HOLD: {
        variant: "secondary" as const,
        className: "bg-orange-100 text-orange-800 border-orange-200",
      },
      CANCELLED: {
        variant: "destructive" as const,
        className: "bg-red-600 text-white",
      },
    };

    const config = badgeConfig[status as keyof typeof badgeConfig] || {
      variant: "outline" as const,
      className: "bg-darkGray2 text-gray-300 border-grayBorders",
    };

    return (
      <Badge
        variant={config.variant}
        className={`${config.className} flex items-center gap-1`}
      >
        {getProjectStatusIcon(status)}
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const handleTechStackToggle = (stackName: string) => {
    setFormData((prev) => ({
      ...prev,
      stacks: prev.stacks.includes(stackName)
        ? prev.stacks.filter((s) => s !== stackName)
        : [...prev.stacks, stackName],
    }));
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-darkGray border-grayBorders">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            {mode === "view" ? "Project Details" : "Edit Project"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-darkGray2/50 border border-grayBorders/30 rounded-xl p-1 h-12">
            <TabsTrigger
              value="basic"
              className="text-gray-400 text-sm font-medium data-[state=active]:bg-darkGray data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:text-gray-200 hover:bg-darkGray/30 px-3 py-2"
            >
              Basic Info
            </TabsTrigger>
            <TabsTrigger
              value="technical"
              className="text-gray-400 text-sm font-medium data-[state=active]:bg-darkGray data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:text-gray-200 hover:bg-darkGray/30 px-3 py-2"
            >
              Technical
            </TabsTrigger>
            <TabsTrigger
              value="meta"
              className="text-gray-400 text-sm font-medium data-[state=active]:bg-darkGray data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:text-gray-200 hover:bg-darkGray/30 px-3 py-2"
            >
              Metadata
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Project Name
                </Label>
                {mode === "view" ? (
                  <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border border-grayBorders">
                    {project.title}
                  </p>
                ) : (
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="bg-darkGray border-grayBorders text-white"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">
                  Description
                </Label>
                {mode === "view" ? (
                  <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border border-grayBorders min-h-[80px]">
                    {project.description || "N/A"}
                  </p>
                ) : (
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="bg-darkGray border-grayBorders text-white min-h-[80px]"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-300">
                    Status
                  </Label>
                  {mode === "view" ? (
                    <div>{getStatusBadge(project.status)}</div>
                  ) : (
                    <Select
                      value={formData.status}
                      onValueChange={(
                        value:
                          | "PLANNED"
                          | "IN_PROGRESS"
                          | "COMPLETED"
                          | "ON_HOLD"
                      ) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger className="bg-darkGray border-grayBorders text-white">
                        <div className="flex items-center gap-2">
                          {getProjectStatusIcon(formData.status)}
                          <SelectValue placeholder="Select status" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-darkGray border-grayBorders">
                        <SelectItem
                          value="PLANNED"
                          className="text-white hover:bg-darkGray2"
                        >
                          Planned
                        </SelectItem>
                        <SelectItem
                          value="IN_PROGRESS"
                          className="text-white hover:bg-darkGray2"
                        >
                          In Progress
                        </SelectItem>
                        <SelectItem
                          value="COMPLETED"
                          className="text-white hover:bg-darkGray2"
                        >
                          Completed
                        </SelectItem>
                        <SelectItem
                          value="ON_HOLD"
                          className="text-white hover:bg-darkGray2"
                        >
                          On Hold
                        </SelectItem>
                        <SelectItem
                          value="CANCELLED"
                          className="text-white hover:bg-darkGray2"
                        >
                          Cancelled
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-gray-300">
                    Budget
                  </Label>
                  {mode === "view" ? (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-white font-medium">
                        ${project.budget || 0}
                      </p>
                    </div>
                  ) : (
                    <Input
                      id="budget"
                      type="number"
                      value={formData.budget}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          budget: Number(e.target.value),
                        })
                      }
                      className="bg-darkGray border-grayBorders text-white"
                    />
                  )}
                </div>
              </div>

              {mode === "edit" && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isPublic: checked })
                    }
                  />
                  <Label htmlFor="isPublic" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Public Project
                  </Label>
                </div>
              )}

              {mode === "view" && (
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-white">
                      {project.isPublic ? "Public" : "Private"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stacks" className="text-gray-300">
                  Tech Stacks
                </Label>
                {mode === "view" ? (
                  <div className="flex flex-wrap gap-2">
                    {project.stacks && project.stacks.length > 0 ? (
                      project.stacks.map((stack: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs bg-slate-100 text-slate-700 border-slate-300"
                        >
                          {stack}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">
                        No tech stacks selected
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 p-3 bg-darkGray2 border border-grayBorders rounded-md min-h-[60px]">
                      {techStacks?.map((stack) => {
                        const isSelected = formData.stacks.includes(stack.name);
                        return (
                          <Badge
                            key={stack._id}
                            variant={isSelected ? "default" : "outline"}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "hover:bg-gray-100 text-gray-700 hover:text-gray-800"
                            }`}
                            onClick={() => handleTechStackToggle(stack.name)}
                          >
                            {stack.name}
                          </Badge>
                        );
                      })}
                      {(!techStacks || techStacks.length === 0) && (
                        <span className="text-gray-400 text-sm">
                          No tech stacks available
                        </span>
                      )}
                    </div>
                    {formData.stacks.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-400">
                          Selected:
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {formData.stacks.map(
                            (stack: string, index: number) => (
                              <Badge
                                key={index}
                                variant="default"
                                className="bg-blue-600 text-white"
                              >
                                {stack}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Repository</Label>
                {project.repositoryId ? (
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-white">{project.repositoryId}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No repository linked</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="meta" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Owner</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-white font-medium">
                      {ownerUser?.name || "Unknown User"}
                    </p>
                  </div>
                  {ownerUser?.email && (
                    <div className="flex items-center gap-2 ml-6">
                      <Mail className="h-3 w-3 text-gray-500" />
                      <p className="text-xs text-gray-400">{ownerUser.email}</p>
                    </div>
                  )}
                </div>
              </div>

              {project.teamLeadId && (
                <div className="space-y-2">
                  <Label className="text-gray-300">Team Lead</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-white font-medium">
                        {teamLeadUser?.name || "Unknown User"}
                      </p>
                    </div>
                    {teamLeadUser?.email && (
                      <div className="flex items-center gap-2 ml-6">
                        <Mail className="h-3 w-3 text-gray-500" />
                        <p className="text-xs text-gray-400">
                          {teamLeadUser.email}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-gray-300">Created</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-white">
                    {new Date(project._creationTime).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Project ID</Label>
                <p className="text-xs text-gray-400 font-mono bg-darkGray2 px-2 py-1 rounded border border-grayBorders">
                  {project._id}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-white bg-darkGray border-grayBorders hover:bg-darkGray2"
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
