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
  Mail,
  Lightbulb,
  Wrench,
  Zap,
  Target,
  CircleDot,
  PlayCircle,
  CheckCircle,
  XCircle,
  ChevronDown,
  Flame,
  TrendingUp,
  Minus,
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

  // Fetch user data for reporter
  const reporterUser = useQuery(
    api.users.getUserProfile,
    issue?.reporterId ? { authUserId: issue.reporterId } : "skip"
  );

  const updateIssue = useMutation(api.issues.updateIssue);

  // Update form data when issue changes
  useEffect(() => {
    if (issue) {
      setFormData({
        title: issue.title || "",
        description: issue.description || "",
        longDescription: issue.longDescription || "",
        status: issue.status || "OPEN",
        priority: issue.priority || "",
        budget: issue.budget || 0,
        type: issue.type || "",
        labels: issue.labels || [],
        onboardingVideoLink: issue.onboardingVideoLink || "",
      });
    }
  }, [issue]);

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

  // Helper functions for icons
  const getIssueTypeIcon = (type: string) => {
    const iconMap = {
      bug: { icon: Bug, className: "text-red-500" },
      feature: { icon: Lightbulb, className: "text-blue-500" },
      enhancement: { icon: TrendingUp, className: "text-green-500" },
      task: { icon: Target, className: "text-purple-500" },
      improvement: { icon: Wrench, className: "text-orange-500" },
      default: { icon: CircleDot, className: "text-gray-400" },
    };

    const normalizedType = type.toLowerCase();
    const config =
      iconMap[normalizedType as keyof typeof iconMap] || iconMap.default;
    const IconComponent = config.icon;

    return <IconComponent className={`h-4 w-4 ${config.className}`} />;
  };

  const getPriorityIcon = (priority: string | undefined) => {
    if (!priority) return <Minus className="h-4 w-4 text-gray-400" />;

    const iconMap = {
      low: { icon: Minus, className: "text-green-500" },
      medium: { icon: AlertTriangle, className: "text-yellow-500" },
      high: { icon: TrendingUp, className: "text-orange-500" },
      critical: { icon: Flame, className: "text-red-500" },
    };

    const normalizedPriority = priority.toLowerCase();
    const config = iconMap[normalizedPriority as keyof typeof iconMap] || {
      icon: Minus,
      className: "text-gray-400",
    };
    const IconComponent = config.icon;

    return <IconComponent className={`h-4 w-4 ${config.className}`} />;
  };

  const getStatusIcon = (status: string) => {
    const iconMap = {
      open: { icon: CircleDot, className: "text-blue-500" },
      in_progress: { icon: PlayCircle, className: "text-yellow-500" },
      resolved: { icon: CheckCircle, className: "text-green-500" },
      closed: { icon: XCircle, className: "text-gray-500" },
    };

    const normalizedStatus = status.toLowerCase();
    const config = iconMap[normalizedStatus as keyof typeof iconMap] || {
      icon: CircleDot,
      className: "text-gray-400",
    };
    const IconComponent = config.icon;

    return <IconComponent className={`h-4 w-4 ${config.className}`} />;
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
        className: "bg-darkGray2 text-gray-300 border-grayBorders",
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
        {getStatusIcon(status)}
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string | undefined) => {
    if (!priority)
      return (
        <Badge
          variant="outline"
          className="bg-darkGray2 text-gray-300 border-grayBorders"
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
      className: "bg-darkGray2 text-gray-300 border-grayBorders",
    };

    return (
      <Badge
        variant={config.variant}
        className={`${config.className} flex items-center gap-1`}
      >
        {getPriorityIcon(priority)}
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-darkGray border-grayBorders">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            {mode === "view" ? "Issue Details" : "Edit Issue"}
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
              value="details"
              className="text-gray-400 text-sm font-medium data-[state=active]:bg-darkGray data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:text-gray-200 hover:bg-darkGray/30 px-3 py-2"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="text-gray-400 text-sm font-medium data-[state=active]:bg-darkGray data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:text-gray-200 hover:bg-darkGray/30 px-3 py-2"
            >
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">
                Title
              </Label>
              {mode === "view" ? (
                <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border border-grayBorders">
                  {issue.title}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-gray-300">
                  Status
                </Label>
                {mode === "view" ? (
                  <div>{getStatusBadge(issue.status)}</div>
                ) : (
                  <Select
                    value={formData.status}
                    onValueChange={(
                      value: "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "OPEN"
                    ) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="bg-darkGray border-grayBorders text-white">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(formData.status)}
                        <SelectValue placeholder="Select status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-darkGray border-grayBorders">
                      <SelectItem
                        value="OPEN"
                        className="text-white hover:bg-darkGray2"
                      >
                        Open
                      </SelectItem>
                      <SelectItem
                        value="IN_PROGRESS"
                        className="text-white hover:bg-darkGray2"
                      >
                        In Progress
                      </SelectItem>
                      <SelectItem
                        value="RESOLVED"
                        className="text-white hover:bg-darkGray2"
                      >
                        Resolved
                      </SelectItem>
                      <SelectItem
                        value="CLOSED"
                        className="text-white hover:bg-darkGray2"
                      >
                        Closed
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-gray-300">
                  Priority
                </Label>
                {mode === "view" ? (
                  <div>{getPriorityBadge(issue.priority)}</div>
                ) : (
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger className="bg-darkGray border-grayBorders text-white">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(formData.priority)}
                        <SelectValue placeholder="Select priority" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-darkGray border-grayBorders">
                      <SelectItem
                        value="LOW"
                        className="text-white hover:bg-darkGray2"
                      >
                        Low
                      </SelectItem>
                      <SelectItem
                        value="MEDIUM"
                        className="text-white hover:bg-darkGray2"
                      >
                        Medium
                      </SelectItem>
                      <SelectItem
                        value="HIGH"
                        className="text-white hover:bg-darkGray2"
                      >
                        High
                      </SelectItem>
                      <SelectItem
                        value="CRITICAL"
                        className="text-white hover:bg-darkGray2"
                      >
                        Critical
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-gray-300">
                  Type
                </Label>
                {mode === "view" ? (
                  <div className="flex items-center gap-2 text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border border-grayBorders">
                    {issue.type && getIssueTypeIcon(issue.type)}
                    <span>{issue.type || "N/A"}</span>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                      {formData.type ? (
                        getIssueTypeIcon(formData.type)
                      ) : (
                        <CircleDot className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <Input
                      id="type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="bg-darkGray border-grayBorders text-white pl-10"
                      placeholder="Bug, Feature, Enhancement..."
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($)</Label>
                {mode === "view" ? (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-white font-medium">
                      {issue.budget ? issue.budget.toLocaleString() : "Not set"}
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
                    className="bg-darkGray border-grayBorders text-white"
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              {mode === "view" ? (
                <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border min-h-[60px]">
                  {issue.description || "No description provided"}
                </p>
              ) : (
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-darkGray border-grayBorders text-white min-h-[60px]"
                  placeholder="Brief description..."
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="longDescription">Detailed Description</Label>
              {mode === "view" ? (
                <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border min-h-[100px]">
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
                  className="bg-darkGray border-grayBorders text-white min-h-[100px]"
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
                    <p className="text-sm text-gray-400">No labels</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    id="labels"
                    value={formData.labels.join(", ")}
                    onChange={(e) => handleLabelsChange(e.target.value)}
                    className="bg-darkGray border-grayBorders text-white"
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
                <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border">
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
                  className="bg-darkGray border-grayBorders text-white"
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
                  <GitBranch className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-white font-mono">
                    {issue.projectId}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Reporter</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-white font-medium">
                      {reporterUser?.name || "Unknown User"}
                    </p>
                  </div>
                  {reporterUser?.email && (
                    <div className="flex items-center gap-2 ml-6">
                      <Mail className="h-3 w-3 text-gray-500" />
                      <p className="text-xs text-gray-400">
                        {reporterUser.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {issue.githubIssueNumber && (
                <div className="space-y-2">
                  <Label>GitHub Issue</Label>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-white">
                      #{issue.githubIssueNumber}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Created</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-white">
                    {new Date(issue._creationTime).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Issue ID</Label>
                <p className="text-xs text-gray-400 font-mono bg-darkGray2 px-2 py-1 rounded border">
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
