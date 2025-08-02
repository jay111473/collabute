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
  DollarSign,
  Hash,
} from "lucide-react";
import { Issue } from "@/types/convex";
import { IssueEditDialog } from "./issue-edit-dialog";

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
    status: "OPEN" as string,
    priority: "MEDIUM" as string,
    type: "BUG" as string,
    assigneeId: "",
    reporterId: "",
    projectId: "",
    budget: "",
  });
  const issues = useQuery(api.issues.list, {}) as Issue[] | undefined;
  const projects = useQuery(api.projects.list, {}) as any[] | undefined;
  const users = useQuery(api.users.list, {}) as any[] | undefined;
  const createIssue = useMutation(api.issues.createIssue);

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

  const formatBudget = (budget: number | undefined) => {
    if (!budget) return "N/A";
    return `$${budget.toLocaleString()}`;
  };

  const handleCreateIssue = async () => {
    if (!formData.title.trim() || !formData.projectId) return;

    setIsLoading(true);
    try {
      await createIssue({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        priority: formData.priority,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        projectId: formData.projectId as any,
        assigneeIds: formData.assigneeId
          ? [formData.assigneeId as any]
          : undefined,
      });

      setIsCreateOpen(false);
      setFormData({
        title: "",
        description: "",
        status: "OPEN",
        priority: "MEDIUM",
        type: "BUG",
        assigneeId: "",
        reporterId: "",
        projectId: "",
        budget: "",
      });
    } catch (error) {
      console.error("Failed to create issue:", error);
    } finally {
      setIsLoading(false);
    }
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
                Category
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
                    Project ID: {issue.projectId}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-300">
                    <DollarSign className="h-3 w-3" />
                    {formatBudget(issue.budget)}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    {issue.category?.slice(0, 2).map((cat) => (
                      <Badge
                        key={cat}
                        variant="outline"
                        className="text-xs bg-slate-100 text-slate-700 border-slate-300"
                      >
                        {cat}
                      </Badge>
                    ))}
                    {issue.category && issue.category.length > 2 && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-slate-100 text-slate-700 border-slate-300"
                      >
                        +{issue.category.length - 2}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Issue</DialogTitle>
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
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUG">Bug</SelectItem>
                  <SelectItem value="FEATURE">Feature</SelectItem>
                  <SelectItem value="ENHANCEMENT">Enhancement</SelectItem>
                  <SelectItem value="TASK">Task</SelectItem>
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
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
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
                !formData.title.trim() || !formData.projectId || isLoading
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
