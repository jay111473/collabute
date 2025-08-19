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
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
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
import { cn } from "@/lib/utils";
import { format } from "date-fns";
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
  CalendarIcon,
  Plus,
  X,
  Check,
  ChevronsUpDown,
  FileText,
  Link as LinkIcon,
  CheckSquare,
  Skills,
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
    estimatedDuration: issue?.estimatedDuration || "",
    deadline: issue?.deadline ? new Date(issue.deadline) : undefined,
    requiredSkills: issue?.requiredSkills || [],
    requirements: issue?.requirements || [],
    dependencies: issue?.dependencies || [],
    category: issue?.category || [],
  });

  // Fetch user data for reporter
  const reporterUser = useQuery(
    api.users.getUserProfile,
    issue?.reporterId ? { authUserId: issue.reporterId } : "skip"
  );
  
  const skills = useQuery(api.skills.list, { isActive: true }) as any[] | undefined;
  const allIssues = useQuery(api.issues.list, {}) as Issue[] | undefined;
  const projects = useQuery(api.projects.list, {}) as any[] | undefined;
  const users = useQuery(api.users.list, {}) as any[] | undefined;
  
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
        estimatedDuration: issue.estimatedDuration || "",
        deadline: issue.deadline ? new Date(issue.deadline) : undefined,
        requiredSkills: issue.requiredSkills || [],
        requirements: issue.requirements || [],
        dependencies: issue.dependencies || [],
        category: issue.category || [],
      });
    }
  }, [issue]);

  const handleSave = async () => {
    if (!issue || mode === "view") return;

    setIsLoading(true);
    try {
      // Get only changed fields by comparing with original issue
      const getChangedFields = (original: any, current: any): any => {
        const changes: any = {};
        Object.keys(current).forEach(key => {
          if (key === 'deadline') {
            // Handle Date objects
            const originalValue = original[key] ? new Date(original[key]).getTime() : null;
            const currentValue = current[key] ? current[key].getTime() : null;
            if (originalValue !== currentValue) {
              changes[key] = currentValue;
            }
          } else if (Array.isArray(current[key])) {
            // Handle arrays
            if (JSON.stringify(original[key] || []) !== JSON.stringify(current[key])) {
              changes[key] = current[key];
            }
          } else if (original[key] !== current[key]) {
            changes[key] = current[key];
          }
        });
        return changes;
      };

      const originalData = {
        title: issue.title,
        description: issue.description,
        longDescription: issue.longDescription,
        status: issue.status,
        priority: issue.priority,
        budget: issue.budget,
        type: issue.type,
        labels: issue.labels || [],
        onboardingVideoLink: issue.onboardingVideoLink,
        estimatedDuration: issue.estimatedDuration,
        deadline: issue.deadline ? new Date(issue.deadline) : undefined,
        requiredSkills: issue.requiredSkills || [],
        requirements: issue.requirements || [],
        dependencies: issue.dependencies || [],
        category: issue.category || [],
      };

      const changes = getChangedFields(originalData, formData);

      if (Object.keys(changes).length === 0) {
        onOpenChange(false);
        return;
      }

      await updateIssue({
        issueId: issue._id,
        updates: changes,
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
          <TabsList className="grid w-full grid-cols-5 bg-darkGray2/50 border border-grayBorders/30 rounded-xl p-1 h-12">
            <TabsTrigger
              value="basic"
              className="text-gray-400 text-sm font-medium data-[state=active]:bg-darkGray data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:text-gray-200 hover:bg-darkGray/30 px-2 py-2"
            >
              Basic
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="text-gray-400 text-sm font-medium data-[state=active]:bg-darkGray data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:text-gray-200 hover:bg-darkGray/30 px-2 py-2"
            >
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="skills"
              className="text-gray-400 text-sm font-medium data-[state=active]:bg-darkGray data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:text-gray-200 hover:bg-darkGray/30 px-2 py-2"
            >
              Skills
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="text-gray-400 text-sm font-medium data-[state=active]:bg-darkGray data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:text-gray-200 hover:bg-darkGray/30 px-2 py-2"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="text-gray-400 text-sm font-medium data-[state=active]:bg-darkGray data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:text-gray-200 hover:bg-darkGray/30 px-2 py-2"
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

          <TabsContent value="timeline" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedDuration" className="text-gray-300">Estimated Duration</Label>
                {mode === "view" ? (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border border-grayBorders">
                      {issue?.estimatedDuration || "Not specified"}
                    </p>
                  </div>
                ) : (
                  <Input
                    id="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedDuration: e.target.value })
                    }
                    className="bg-darkGray border-grayBorders text-white"
                    placeholder="4-6 hours, 2 days, 1 week"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-gray-300">Deadline</Label>
                {mode === "view" ? (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border border-grayBorders">
                      {issue?.deadline
                        ? format(new Date(issue.deadline), "PPP")
                        : "No deadline set"}
                    </p>
                  </div>
                ) : (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-darkGray border-grayBorders text-white hover:bg-darkGray2",
                          !formData.deadline && "text-gray-400"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.deadline ? format(formData.deadline, "PPP") : "Pick a deadline"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-darkGray border-grayBorders">
                      <CalendarComponent
                        mode="single"
                        selected={formData.deadline}
                        onSelect={(date: Date | undefined) => setFormData({ ...formData, deadline: date })}
                        initialFocus
                        className="bg-darkGray text-white"
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Dependencies</Label>
              {mode === "view" ? (
                <div className="space-y-2">
                  {issue?.dependencies && issue.dependencies.length > 0 ? (
                    issue.dependencies.map((depId) => {
                      const dependency = allIssues?.find(i => i._id === depId);
                      return dependency ? (
                        <div key={depId} className="flex items-center gap-2 p-2 bg-darkGray2 rounded border border-grayBorders">
                          <LinkIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-white">{dependency.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {dependency.status}
                          </Badge>
                        </div>
                      ) : null;
                    })
                  ) : (
                    <p className="text-sm text-gray-400">No dependencies</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between bg-darkGray border-grayBorders text-white hover:bg-darkGray2"
                      >
                        {formData.dependencies.length > 0
                          ? `${formData.dependencies.length} dependencies selected`
                          : "Select dependencies..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 bg-darkGray border-grayBorders">
                      <Command className="bg-darkGray">
                        <CommandInput placeholder="Search issues..." className="text-white" />
                        <CommandEmpty>No issues found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {allIssues?.filter(i => i._id !== issue?._id).map((issueItem) => (
                            <CommandItem
                              key={issueItem._id}
                              onSelect={() => {
                                const isSelected = formData.dependencies.includes(issueItem._id);
                                if (isSelected) {
                                  setFormData({
                                    ...formData,
                                    dependencies: formData.dependencies.filter(id => id !== issueItem._id)
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    dependencies: [...formData.dependencies, issueItem._id]
                                  });
                                }
                              }}
                              className="text-white hover:bg-darkGray2"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.dependencies.includes(issueItem._id) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex items-center gap-2">
                                <span className="truncate">{issueItem.title}</span>
                                <Badge variant="outline" className="text-xs">
                                  {issueItem.status}
                                </Badge>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {formData.dependencies.length > 0 && (
                    <div className="space-y-2">
                      {formData.dependencies.map((depId) => {
                        const dependency = allIssues?.find(i => i._id === depId);
                        return dependency ? (
                          <div key={depId} className="flex items-center gap-2 p-2 bg-darkGray2 rounded border border-grayBorders">
                            <LinkIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-white flex-1">{dependency.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {dependency.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  dependencies: formData.dependencies.filter(id => id !== depId)
                                });
                              }}
                              className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Required Skills</Label>
              {mode === "view" ? (
                <div className="flex flex-wrap gap-2">
                  {issue?.requiredSkills && issue.requiredSkills.length > 0 ? (
                    issue.requiredSkills.map((skillId) => {
                      const skill = skills?.find(s => s._id === skillId);
                      return skill ? (
                        <Badge
                          key={skillId}
                          variant="outline"
                          className="bg-purple-100 text-purple-700 border-purple-300 flex items-center gap-1"
                        >
                          <Skills className="h-3 w-3" />
                          {skill.name}
                        </Badge>
                      ) : null;
                    })
                  ) : (
                    <p className="text-sm text-gray-400">No skills specified</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between bg-darkGray border-grayBorders text-white hover:bg-darkGray2"
                      >
                        {formData.requiredSkills.length > 0
                          ? `${formData.requiredSkills.length} skills selected`
                          : "Select skills..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 bg-darkGray border-grayBorders">
                      <Command className="bg-darkGray">
                        <CommandInput placeholder="Search skills..." className="text-white" />
                        <CommandEmpty>No skills found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {skills?.map((skill) => (
                            <CommandItem
                              key={skill._id}
                              onSelect={() => {
                                const isSelected = formData.requiredSkills.includes(skill._id);
                                if (isSelected) {
                                  setFormData({
                                    ...formData,
                                    requiredSkills: formData.requiredSkills.filter(id => id !== skill._id)
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    requiredSkills: [...formData.requiredSkills, skill._id]
                                  });
                                }
                              }}
                              className="text-white hover:bg-darkGray2"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.requiredSkills.includes(skill._id) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex items-center gap-2">
                                <Skills className="h-4 w-4 text-purple-500" />
                                <span>{skill.name}</span>
                                {skill.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {skill.category}
                                  </Badge>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {formData.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.requiredSkills.map((skillId) => {
                        const skill = skills?.find(s => s._id === skillId);
                        return skill ? (
                          <Badge
                            key={skillId}
                            variant="outline"
                            className="bg-purple-100 text-purple-700 border-purple-300 flex items-center gap-1"
                          >
                            <Skills className="h-3 w-3" />
                            {skill.name}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-1 h-4 w-4 p-0 hover:bg-purple-200"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  requiredSkills: formData.requiredSkills.filter(id => id !== skillId)
                                });
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300">Requirements Checklist</Label>
                {mode === "edit" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        requirements: [...formData.requirements, { text: "", completed: false }]
                      });
                    }}
                    className="bg-darkGray border-grayBorders text-white hover:bg-darkGray2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Requirement
                  </Button>
                )}
              </div>
              {formData.requirements.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-darkGray2 rounded border border-grayBorders">
                      <Checkbox
                        checked={req.completed}
                        onCheckedChange={(checked) => {
                          if (mode === "edit") {
                            const updated = [...formData.requirements];
                            updated[index] = { ...updated[index], completed: !!checked };
                            setFormData({ ...formData, requirements: updated });
                          }
                        }}
                        disabled={mode === "view"}
                        className="mt-0.5"
                      />
                      {mode === "view" ? (
                        <div className="flex-1">
                          <p className={cn(
                            "text-sm",
                            req.completed ? "text-green-400 line-through" : "text-white"
                          )}>
                            {req.text}
                          </p>
                        </div>
                      ) : (
                        <>
                          <Input
                            placeholder="Requirement text..."
                            value={req.text}
                            onChange={(e) => {
                              const updated = [...formData.requirements];
                              updated[index] = { ...updated[index], text: e.target.value };
                              setFormData({ ...formData, requirements: updated });
                            }}
                            className="bg-darkGray border-grayBorders text-white flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                requirements: formData.requirements.filter((_, i) => i !== index)
                              });
                            }}
                            className="text-red-400 hover:text-red-300 hover:bg-darkGray p-1"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-8 bg-darkGray2 rounded border border-grayBorders">
                  No requirements specified
                </p>
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

            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="category">Category</Label>
                {mode === "view" ? (
                  <div className="flex flex-wrap gap-2">
                    {issue.category && issue.category.length > 0 ? (
                      issue.category.map((cat: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs bg-blue-100 text-blue-700 border-blue-300"
                        >
                          {cat}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">No categories</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      id="category"
                      value={formData.category.join(", ")}
                      onChange={(e) => {
                        const categories = e.target.value
                          .split(",")
                          .map((cat) => cat.trim())
                          .filter(Boolean);
                        setFormData({ ...formData, category: categories });
                      }}
                      className="bg-darkGray border-grayBorders text-white"
                      placeholder="ui, api, database (comma separated)"
                    />
                    {formData.category.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.category.map((cat: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-blue-100 text-blue-700 border-blue-300"
                          >
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
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
