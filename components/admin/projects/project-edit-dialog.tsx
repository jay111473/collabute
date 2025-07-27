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

  const updateProject = useMutation(api.projects.updateProject);

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

  const getStatusBadge = (status: string | undefined) => {
    if (!status)
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-700 border-gray-300"
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
      className: "bg-gray-50 text-gray-700 border-gray-300",
    };

    return (
      <Badge variant={config.variant} className={config.className}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const handleStacksChange = (value: string) => {
    const stackArray = value
      .split(",")
      .map((stack) => stack.trim())
      .filter(Boolean);
    setFormData({ ...formData, stacks: stackArray });
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            {mode === "view" ? "Project Details" : "Edit Project"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="meta">Metadata</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                {mode === "view" ? (
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                    {project.title}
                  </p>
                ) : (
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="bg-white border-gray-300 text-gray-900"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                {mode === "view" ? (
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border min-h-[80px]">
                    {project.description || "N/A"}
                  </p>
                ) : (
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="bg-white border-gray-300 text-gray-900 min-h-[80px]"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
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
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PLANNED">Planned</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="ON_HOLD">On Hold</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget</Label>
                  {mode === "view" ? (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <p className="text-sm text-gray-900 font-medium">
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
                      className="bg-white border-gray-300 text-gray-900"
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
                    <Globe className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-900">
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
                <Label htmlFor="stacks">Tech Stacks</Label>
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
                      <p className="text-sm text-gray-500">N/A</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      id="stacks"
                      value={formData.stacks.join(", ")}
                      onChange={(e) => handleStacksChange(e.target.value)}
                      className="bg-white border-gray-300 text-gray-900"
                      placeholder="React, TypeScript, Node.js (comma separated)"
                    />
                    {formData.stacks.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.stacks.map((stack: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-slate-100 text-slate-700 border-slate-300"
                          >
                            {stack}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Repository</Label>
                {project.repositoryId ? (
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-900">
                      {project.repositoryId}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No repository linked</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="meta" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Owner</Label>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-900">{project.ownerId}</p>
                </div>
              </div>

              {project.teamLeadId && (
                <div className="space-y-2">
                  <Label>Team Lead</Label>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-900">
                      {project.teamLeadId}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Created</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-900">
                    {new Date(project._creationTime).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Project ID</Label>
                <p className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded border">
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
