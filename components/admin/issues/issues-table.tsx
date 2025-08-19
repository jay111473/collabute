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
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DollarSign,
  Hash,
  Bug,
  Lightbulb,
  TrendingUp,
  Target,
  Wrench,
  CircleDot,
  AlertTriangle,
  Flame,
  Minus,
  Clock,
  CalendarIcon,
  Skills,
  FileText,
  Link as LinkIcon,
  CheckSquare,
  X,
  Check,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { Issue } from "@/types/convex";
import { IssueEditDialog } from "./issue-edit-dialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function IssuesTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDescription: "",
    status: "OPEN" as string,
    priority: "MEDIUM" as string,
    type: "BUG" as string,
    assigneeId: "",
    reporterId: "",
    projectId: "",
    budget: "",
    estimatedDuration: "",
    deadline: undefined as Date | undefined,
    requiredSkills: [] as string[],
    requirements: [] as Array<{ text: string; completed: boolean }>,
    dependencies: [] as string[],
    files: [] as string[],
    labels: [] as string[],
    category: [] as string[],
  });
  const issues = useQuery(api.issues.list, {}) as Issue[] | undefined;
  const projects = useQuery(api.projects.list, {}) as any[] | undefined;
  const users = useQuery(api.users.list, {}) as any[] | undefined;
  const skills = useQuery(api.skills.list, { isActive: true }) as any[] | undefined;
  const allIssues = useQuery(api.issues.list, {}) as Issue[] | undefined; // For dependencies
  const createIssue = useMutation(api.issues.createIssue);
  const deleteIssue = useMutation(api.issues.deleteIssue);

  const filteredIssues = issues?.filter(
    (issue) =>
      issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        variant: "outline" as const,
        className: "bg-green-100 text-green-800 border-green-200",
      },
      CLOSED: {
        variant: "destructive" as const,
        className: "bg-gray-600 text-white",
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

  const getPriorityBadge = (priority: string | undefined) => {
    if (!priority) return null;

    const badgeConfig = {
      LOW: {
        variant: "outline" as const,
        className: "text-xs bg-gray-100 text-gray-300 border-grayBorders",
      },
      MEDIUM: {
        variant: "secondary" as const,
        className: "text-xs bg-blue-100 text-blue-800 border-blue-200",
      },
      HIGH: {
        variant: "destructive" as const,
        className: "text-xs bg-orange-100 text-orange-800 border-orange-200",
      },
      URGENT: {
        variant: "default" as const,
        className: "text-xs bg-red-600 text-white",
      },
    };

    const config = badgeConfig[priority as keyof typeof badgeConfig] || {
      variant: "outline" as const,
      className: "text-xs bg-darkGray2 text-gray-300 border-grayBorders",
    };

    return (
      <Badge variant={config.variant} className={config.className}>
        {priority}
      </Badge>
    );
  };

  // Helper functions for icons
  const getIssueTypeIcon = (type: string) => {
    const iconMap = {
      bug: { icon: Bug, className: "text-red-500" },
      feature: { icon: Lightbulb, className: "text-blue-500" },
      enhancement: { icon: TrendingUp, className: "text-green-500" },
      task: { icon: Target, className: "text-purple-500" },
      improvement: { icon: Wrench, className: "text-orange-500" },
      default: { icon: CircleDot, className: "text-gray-400" }
    };
    
    const normalizedType = type.toLowerCase();
    const config = iconMap[normalizedType as keyof typeof iconMap] || iconMap.default;
    const IconComponent = config.icon;
    
    return <IconComponent className={`h-4 w-4 ${config.className}`} />;
  };

  const getPriorityIcon = (priority: string | undefined) => {
    if (!priority) return <Minus className="h-4 w-4 text-gray-400" />;
    
    const iconMap = {
      low: { icon: Minus, className: "text-green-500" },
      medium: { icon: AlertTriangle, className: "text-yellow-500" },
      high: { icon: TrendingUp, className: "text-orange-500" },
      urgent: { icon: Flame, className: "text-red-500" },
      critical: { icon: Flame, className: "text-red-500" }
    };
    
    const normalizedPriority = priority.toLowerCase();
    const config = iconMap[normalizedPriority as keyof typeof iconMap] || { icon: Minus, className: "text-gray-400" };
    const IconComponent = config.icon;
    
    return <IconComponent className={`h-4 w-4 ${config.className}`} />;
  };

  const formatBudget = (budget: number | undefined) => {
    if (!budget) return "N/A";
    return budget.toLocaleString();
  };

  const getProjectName = (projectId: string) => {
    const project = projects?.find(p => p._id === projectId);
    return project?.title || project?.name || "Unknown Project";
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (!confirm("Are you sure you want to delete this issue? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteIssue({ issueId: issueId as any });
    } catch (error) {
      console.error("Failed to delete issue:", error);
    }
  };

  const handleCreateIssue = async () => {
    if (!formData.title.trim() || !formData.projectId) return;

    setIsLoading(true);
    try {
      await createIssue({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        longDescription: formData.longDescription.trim() || undefined,
        type: formData.type,
        priority: formData.priority,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        estimatedDuration: formData.estimatedDuration || undefined,
        deadline: formData.deadline ? formData.deadline.getTime() : undefined,
        requiredSkills: formData.requiredSkills.length > 0 ? formData.requiredSkills as any : undefined,
        requirements: formData.requirements.length > 0 ? formData.requirements : undefined,
        dependencies: formData.dependencies.length > 0 ? formData.dependencies as any : undefined,
        labels: formData.labels.length > 0 ? formData.labels : undefined,
        category: formData.category.length > 0 ? formData.category : undefined,
        projectId: formData.projectId as any,
        assigneeIds: formData.assigneeId
          ? [formData.assigneeId as any]
          : undefined,
      });

      setIsCreateOpen(false);
      setFormData({
        title: "",
        description: "",
        longDescription: "",
        status: "OPEN",
        priority: "MEDIUM",
        type: "BUG",
        assigneeId: "",
        reporterId: "",
        projectId: "",
        budget: "",
        estimatedDuration: "",
        deadline: undefined,
        requiredSkills: [],
        requirements: [],
        dependencies: [],
        files: [],
        labels: [],
        category: [],
      });
    } catch (error) {
      console.error("Failed to create issue:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, { text: "", completed: false }]
    });
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index)
    });
  };

  const updateRequirement = (index: number, field: 'text' | 'completed', value: string | boolean) => {
    const updated = [...formData.requirements];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, requirements: updated });
  };

  const handleViewIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setDialogMode("view");
    setIsDetailsOpen(true);
  };

  const handleEditIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setDialogMode("edit");
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search issues..."
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
          Add Issue
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
                Priority
              </TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">
                Project
              </TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">
                Budget
              </TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">
                Duration
              </TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">
                Deadline
              </TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">
                Skills
              </TableHead>
              <TableHead className="text-right text-gray-300 font-medium px-6 py-4">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-darkGray">
            {filteredIssues?.map((issue) => (
              <TableRow
                key={issue._id}
                className="border-b border-grayBorders hover:bg-darkGray2 transition-colors duration-150"
              >
                <TableCell className="px-6 py-4">
                  <div>
                    <div className="font-medium text-white">
                      {issue.title}
                    </div>
                    <div className="text-sm text-gray-400 truncate max-w-xs">
                      {issue.description}
                    </div>
                    {issue.githubIssueNumber && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Hash className="h-3 w-3" />
                        GitHub #{issue.githubIssueNumber}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  {getStatusBadge(issue.status)}
                </TableCell>
                <TableCell className="px-4 py-4">
                  {getPriorityBadge(issue.priority)}
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="text-sm text-gray-300">
                    {getProjectName(issue.projectId)}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-300">
                    <DollarSign className="h-3 w-3" />
                    {formatBudget(issue.budget)}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-300">
                    <Clock className="h-3 w-3" />
                    {issue.estimatedDuration || "N/A"}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-300">
                    <CalendarIcon className="h-3 w-3" />
                    {issue.deadline
                      ? format(new Date(issue.deadline), "MMM d, yyyy")
                      : "No deadline"}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    {issue.requiredSkills?.slice(0, 2).map((skillId) => {
                      const skill = skills?.find(s => s._id === skillId);
                      return skill ? (
                        <Badge
                          key={skillId}
                          variant="outline"
                          className="text-xs bg-purple-100 text-purple-700 border-purple-300"
                        >
                          {skill.name}
                        </Badge>
                      ) : null;
                    })}
                    {issue.requiredSkills && issue.requiredSkills.length > 2 && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-purple-100 text-purple-700 border-purple-300"
                      >
                        +{issue.requiredSkills.length - 2}
                      </Badge>
                    )}
                    {(!issue.requiredSkills || issue.requiredSkills.length === 0) && (
                      <span className="text-xs text-gray-500">No skills</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-blue-400 hover:bg-darkGray2 transition-colors duration-150"
                      onClick={() => handleViewIssue(issue)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-amber-400 hover:bg-darkGray2 transition-colors duration-150"
                      onClick={() => handleEditIssue(issue)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-300 hover:bg-darkGray2 transition-colors duration-150"
                      onClick={() => handleDeleteIssue(issue._id)}
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

      {filteredIssues?.length === 0 && (
        <div className="text-center py-8 text-gray-400">No issues found</div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-darkGray border-grayBorders">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Issue
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Issue title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="bg-darkGray border-grayBorders text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Issue description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-darkGray border-grayBorders min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectId">Project *</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) =>
                  setFormData({ ...formData, projectId: value })
                }
              >
                <SelectTrigger className="bg-darkGray border-grayBorders text-white">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.title || project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="bg-darkGray border-grayBorders text-white">
                  <div className="flex items-center gap-2">
                    {getIssueTypeIcon(formData.type)}
                    <SelectValue placeholder="Select type" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-darkGray border-grayBorders">
                  <SelectItem value="BUG" className="text-white hover:bg-darkGray2">
                    Bug
                  </SelectItem>
                  <SelectItem value="FEATURE" className="text-white hover:bg-darkGray2">
                    Feature
                  </SelectItem>
                  <SelectItem value="ENHANCEMENT" className="text-white hover:bg-darkGray2">
                    Enhancement
                  </SelectItem>
                  <SelectItem value="TASK" className="text-white hover:bg-darkGray2">
                    Task
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
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
                  <SelectItem value="LOW" className="text-white hover:bg-darkGray2">
                    Low
                  </SelectItem>
                  <SelectItem value="MEDIUM" className="text-white hover:bg-darkGray2">
                    Medium
                  </SelectItem>
                  <SelectItem value="HIGH" className="text-white hover:bg-darkGray2">
                    High
                  </SelectItem>
                  <SelectItem value="URGENT" className="text-white hover:bg-darkGray2">
                    Urgent
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigneeId">Assignee</Label>
              <Select
                value={formData.assigneeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, assigneeId: value })
                }
              >
                <SelectTrigger className="bg-darkGray border-grayBorders text-white">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="1000"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                  className="bg-darkGray border-grayBorders text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">Estimated Duration</Label>
                <Input
                  id="estimatedDuration"
                  placeholder="4-6 hours, 2 days, 1 week"
                  value={formData.estimatedDuration}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedDuration: e.target.value })
                  }
                  className="bg-darkGray border-grayBorders text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription">Detailed Description</Label>
              <Textarea
                id="longDescription"
                placeholder="Detailed requirements, acceptance criteria, technical details..."
                value={formData.longDescription}
                onChange={(e) =>
                  setFormData({ ...formData, longDescription: e.target.value })
                }
                className="bg-darkGray border-grayBorders min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
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
                  <Calendar
                    mode="single"
                    selected={formData.deadline}
                    onSelect={(date: Date | undefined) => setFormData({ ...formData, deadline: date })}
                    initialFocus
                    className="bg-darkGray text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredSkills">Required Skills</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
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
                          {skill.name}
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
                        className="bg-purple-100 text-purple-700 border-purple-300"
                      >
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Requirements Checklist</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRequirement}
                  className="bg-darkGray border-grayBorders text-white hover:bg-darkGray2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Requirement
                </Button>
              </div>
              {formData.requirements.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-darkGray2 rounded border border-grayBorders">
                      <Checkbox
                        checked={req.completed}
                        onCheckedChange={(checked) => updateRequirement(index, 'completed', !!checked)}
                      />
                      <Input
                        placeholder="Requirement text..."
                        value={req.text}
                        onChange={(e) => updateRequirement(index, 'text', e.target.value)}
                        className="bg-darkGray border-grayBorders text-white flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRequirement(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-darkGray p-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="labels">Labels</Label>
                <Input
                  id="labels"
                  placeholder="urgent, frontend, bug (comma-separated)"
                  value={formData.labels.join(", ")}
                  onChange={(e) => {
                    const labels = e.target.value
                      .split(",")
                      .map(label => label.trim())
                      .filter(Boolean);
                    setFormData({ ...formData, labels });
                  }}
                  className="bg-darkGray border-grayBorders text-white"
                />
                {formData.labels.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.labels.map((label, index) => (
                      <Badge key={index} variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="ui, api, database (comma-separated)"
                  value={formData.category.join(", ")}
                  onChange={(e) => {
                    const category = e.target.value
                      .split(",")
                      .map(cat => cat.trim())
                      .filter(Boolean);
                    setFormData({ ...formData, category });
                  }}
                  className="bg-darkGray border-grayBorders text-white"
                />
                {formData.category.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.category.map((cat, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
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
              onClick={handleCreateIssue}
              disabled={
                !formData.title.trim() || !formData.projectId || !formData.type || !formData.priority || isLoading
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Creating..." : "Create Issue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <IssueEditDialog
        issue={selectedIssue}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        mode={dialogMode}
      />
    </div>
  );
}
