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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Issue } from "@/types/convex";
import {
  Bug,
  DollarSign,
  Calendar,
  GitBranch,
  AlertTriangle,
  Clock,
  User,
  Hash,
} from "lucide-react";

interface IssueEditDialogProps {
  issue: Issue | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "view" | "edit";
}

export function IssueEditDialog({
  issue,
  isOpen,
  onOpenChange,
  mode,
}: IssueEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: issue?.title || "",
    description: issue?.description || "",
    longDescription: issue?.longDescription || "",
    status: issue?.status || "OPEN",
    priority: issue?.priority || "",
    budget: issue?.budget || 0,
    type: issue?.type || "",
    labels: issue?.labels || [],
    onboardingVideoLink: issue?.onboardingVideoLink || "",
  });

  const updateIssue = useMutation(api.issues.updateIssue);

  const handleSave = async () => {
    if (!issue || mode === "view") return;

    setIsLoading(true);
    try {
      await updateIssue({
        issueId: issue._id,
        updates: {
          ...formData,
          status: formData.status as any,
        },
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update issue:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badgeConfig = {
      OPEN: {
        variant: "default" as const,
        className: "bg-blue-600 text-white",
      },
      IN_PROGRESS: {
        variant: "secondary" as const,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      RESOLVED: {
        variant: "default" as const,
        className: "bg-green-600 text-white",
      },
      CLOSED: {
        variant: "outline" as const,
        className: "bg-gray-50 text-gray-700 border-gray-300",
      },
    };

    const config = badgeConfig[status as keyof typeof badgeConfig] || {
      variant: "outline" as const,
      className: "bg-gray-50 text-gray-700 border-gray-300",
    };

    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string | undefined) => {
    if (!priority)
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-700 border-gray-300"
        >
          N/A
        </Badge>
      );

    const badgeConfig = {
      LOW: {
        variant: "outline" as const,
        className: "bg-green-50 text-green-700 border-green-300",
      },
      MEDIUM: {
        variant: "secondary" as const,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      HIGH: {
        variant: "destructive" as const,
        className: "bg-orange-600 text-white",
      },
      CRITICAL: {
        variant: "destructive" as const,
        className: "bg-red-600 text-white",
      },
    };

    const config = badgeConfig[priority as keyof typeof badgeConfig] || {
      variant: "outline" as const,
      className: "bg-gray-50 text-gray-700 border-gray-300",
    };

    return (
      <Badge variant={config.variant} className={config.className}>
        {priority}
      </Badge>
    );
  };

  const handleLabelsChange = (value: string) => {
    const labelsArray = value
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean);
    setFormData({ ...formData, labels: labelsArray });
  };

  if (!issue) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            {mode === "view" ? "Issue Details" : "Edit Issue"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              {mode === "view" ? (
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                  {issue.title}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                {mode === "view" ? (
                  <div>{getStatusBadge(issue.status)}</div>
                ) : (
                  <Select
                    value={formData.status}
                    onValueChange={(
                      value: "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "OPEN"
                    ) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                {mode === "view" ? (
                  <div>{getPriorityBadge(issue.priority)}</div>
                ) : (
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                {mode === "view" ? (
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                    {issue.type || "N/A"}
                  </p>
                ) : (
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="Bug, Feature, Enhancement..."
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($)</Label>
                {mode === "view" ? (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-900 font-medium">
                      {issue.budget ? `$${issue.budget}` : "Not set"}
                    </p>
                  </div>
                ) : (
                  <Input
                    id="budget"
                    type="number"
                    min="0"
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

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              {mode === "view" ? (
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border min-h-[60px]">
                  {issue.description || "No description provided"}
                </p>
              ) : (
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-white border-gray-300 text-gray-900 min-h-[60px]"
                  placeholder="Brief description..."
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="longDescription">Detailed Description</Label>
              {mode === "view" ? (
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border min-h-[100px]">
                  {issue.longDescription || "No detailed description provided"}
                </p>
              ) : (
                <Textarea
                  id="longDescription"
                  value={formData.longDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      longDescription: e.target.value,
                    })
                  }
                  className="bg-white border-gray-300 text-gray-900 min-h-[100px]"
                  placeholder="Detailed description, requirements, acceptance criteria..."
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="labels">Labels</Label>
              {mode === "view" ? (
                <div className="flex flex-wrap gap-2">
                  {issue.labels && issue.labels.length > 0 ? (
                    issue.labels.map((label: string, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs bg-slate-100 text-slate-700 border-slate-300"
                      >
                        {label}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No labels</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    id="labels"
                    value={formData.labels.join(", ")}
                    onChange={(e) => handleLabelsChange(e.target.value)}
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="bug, frontend, urgent (comma separated)"
                  />
                  {formData.labels.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.labels.map((label: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs bg-slate-100 text-slate-700 border-slate-300"
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="onboardingVideo">Onboarding Video Link</Label>
              {mode === "view" ? (
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                  {issue.onboardingVideoLink || "No video link provided"}
                </p>
              ) : (
                <Input
                  id="onboardingVideo"
                  value={formData.onboardingVideoLink}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      onboardingVideoLink: e.target.value,
                    })
                  }
                  className="bg-white border-gray-300 text-gray-900"
                  placeholder="https://..."
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Project ID</Label>
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-900 font-mono">
                    {issue.projectId}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reporter ID</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-900 font-mono">
                    {issue.reporterId}
                  </p>
                </div>
              </div>

              {issue.githubIssueNumber && (
                <div className="space-y-2">
                  <Label>GitHub Issue</Label>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-900">
                      #{issue.githubIssueNumber}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Created</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-900">
                    {new Date(issue._creationTime).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Issue ID</Label>
                <p className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded border">
                  {issue._id}
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
