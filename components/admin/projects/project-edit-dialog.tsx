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
import { Progress } from "@/components/ui/progress";
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
  Layers,
  AlertCircle,
  Trash2,
  Plus,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { PHASE_STATUS, PROJECT_TYPE } from "@/convex/schema";

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
  const [originalData, setOriginalData] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: project?.title || "",
    description: project?.description || "",
    status: project?.status || "PLANNED",
    type: project?.type || "",
    budget: project?.budget || 0,
    isPublic: project?.isPublic ?? true,
    stacks: project?.stacks || [],
    teamLeadId: project?.teamLeadId || "",
    phases: project?.phases || [],
  });

  // Fetch data for dropdowns
  const techStacks = useQuery(api.tech_stacks.list, { isActive: true });
  const users = useQuery(api.users.list, {});
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
      const initialData = {
        title: project.title || "",
        description: project.description || "",
        status: project.status || "PLANNED",
        type: project.type || "",
        budget: project.budget || 0,
        isPublic: project.isPublic ?? true,
        stacks: project.stacks || [],
        teamLeadId: project.teamLeadId || "",
        phases: project.phases || [],
      };
      setOriginalData(initialData);
      setFormData(initialData);
    }
  }, [project]);

  // Utility function to get only changed fields
  const getChangedFields = (original: any, current: any): any => {
    const changes: any = {};
    
    Object.keys(current).forEach(key => {
      const originalValue = original[key];
      const currentValue = current[key];
      
      // Handle different types of comparisons
      if (Array.isArray(originalValue) && Array.isArray(currentValue)) {
        if (JSON.stringify(originalValue) !== JSON.stringify(currentValue)) {
          changes[key] = currentValue;
        }
      } else if (typeof originalValue === 'object' && typeof currentValue === 'object' && originalValue !== null && currentValue !== null) {
        if (JSON.stringify(originalValue) !== JSON.stringify(currentValue)) {
          changes[key] = currentValue;
        }
      } else if (originalValue !== currentValue) {
        // Only include non-empty values for string fields
        if (typeof currentValue === 'string') {
          if (currentValue.trim() !== '') {
            changes[key] = currentValue;
          }
        } else {
          changes[key] = currentValue;
        }
      }
    });
    
    return changes;
  };

  const handleSave = async () => {
    if (!project || mode === "view" || !originalData) return;

    setIsLoading(true);
    try {
      // Get only the fields that have actually changed
      const changedFields = getChangedFields(originalData, formData);
      
      // Only proceed if there are actual changes
      if (Object.keys(changedFields).length === 0) {
        console.log("No changes detected, skipping update");
        onOpenChange(false);
        return;
      }

      console.log("Sending only changed fields:", changedFields);

      await updateProject({
        projectId: project._id,
        updates: changedFields,
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
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-darkGray border-grayBorders">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            {mode === "view" ? "Project Details" : "Edit Project"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-darkGray2/50 border border-grayBorders/30 rounded-xl p-1 h-12">
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
              value="phases"
              className="text-gray-400 text-sm font-medium data-[state=active]:bg-darkGray data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:text-gray-200 hover:bg-darkGray/30 px-3 py-2"
            >
              Phases
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
                  <Label htmlFor="type" className="text-gray-300">
                    Project Type
                  </Label>
                  {mode === "view" ? (
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-white">
                        {project.type?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Not specified"}
                      </p>
                    </div>
                  ) : (
                    <Select
                      value={formData.type || ""}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger className="bg-darkGray border-grayBorders text-white">
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent className="bg-darkGray border-grayBorders max-h-[300px]">
                        <SelectItem value={PROJECT_TYPE.FRONTEND} className="text-white hover:bg-darkGray2">Frontend</SelectItem>
                        <SelectItem value={PROJECT_TYPE.BACKEND} className="text-white hover:bg-darkGray2">Backend</SelectItem>
                        <SelectItem value={PROJECT_TYPE.DEVOPS} className="text-white hover:bg-darkGray2">DevOps</SelectItem>
                        <SelectItem value={PROJECT_TYPE.MOBILE} className="text-white hover:bg-darkGray2">Mobile</SelectItem>
                        <SelectItem value={PROJECT_TYPE.DATA_ANALYTICS} className="text-white hover:bg-darkGray2">Data Analytics</SelectItem>
                        <SelectItem value={PROJECT_TYPE.AI_ML} className="text-white hover:bg-darkGray2">AI/ML</SelectItem>
                        <SelectItem value={PROJECT_TYPE.EMBEDDED_IOT} className="text-white hover:bg-darkGray2">Embedded/IoT</SelectItem>
                        <SelectItem value={PROJECT_TYPE.DESKTOP} className="text-white hover:bg-darkGray2">Desktop</SelectItem>
                        <SelectItem value={PROJECT_TYPE.GAME} className="text-white hover:bg-darkGray2">Game</SelectItem>
                        <SelectItem value={PROJECT_TYPE.BLOCKCHAIN_WEB3} className="text-white hover:bg-darkGray2">Blockchain/Web3</SelectItem>
                        <SelectItem value={PROJECT_TYPE.CLOUD_INFRASTRUCTURE} className="text-white hover:bg-darkGray2">Cloud Infrastructure</SelectItem>
                        <SelectItem value={PROJECT_TYPE.SECURITY} className="text-white hover:bg-darkGray2">Security</SelectItem>
                        <SelectItem value={PROJECT_TYPE.DATABASE} className="text-white hover:bg-darkGray2">Database</SelectItem>
                        <SelectItem value={PROJECT_TYPE.API_INTEGRATION} className="text-white hover:bg-darkGray2">API Integration</SelectItem>
                        <SelectItem value={PROJECT_TYPE.AR_VR} className="text-white hover:bg-darkGray2">AR/VR</SelectItem>
                        <SelectItem value={PROJECT_TYPE.AUDIO_VIDEO} className="text-white hover:bg-darkGray2">Audio/Video</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

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
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="teamLead" className="text-gray-300">
                    Team Lead
                  </Label>
                  {mode === "view" ? (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-white">
                        {teamLeadUser?.name || "No team lead assigned"}
                      </p>
                    </div>
                  ) : (
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
                        <SelectItem
                          value="none"
                          className="text-white hover:bg-darkGray2"
                        >
                          No team lead
                        </SelectItem>
                        {users?.map((user) => (
                          <SelectItem
                            key={user._id}
                            value={user._id}
                            className="text-white hover:bg-darkGray2"
                          >
                            {user.email || user.name || "Unknown User"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

          <TabsContent value="phases" className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Project Phases</h3>
                  <p className="text-sm text-gray-400 mt-1">Track progress through different stages of development</p>
                </div>
                {mode === "edit" && formData.phases.length > 0 && (
                  <Button
                    onClick={() => {
                      const newPhase = {
                        name: "New Phase",
                        status: PHASE_STATUS.NOT_STARTED,
                        percentageDone: 0,
                        note: "",
                      };
                      setFormData({ ...formData, phases: [...formData.phases, newPhase] });
                    }}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Phase
                  </Button>
                )}
              </div>

              {formData.phases && formData.phases.length > 0 ? (
                <div className="space-y-4">
                  {formData.phases.map((phase: any, index: number) => {
                    const getPhaseStatusConfig = () => {
                      switch (phase.status) {
                        case PHASE_STATUS.COMPLETED:
                          return {
                            icon: <CheckCircle className="h-5 w-5" />,
                            color: "text-emerald-400",
                            bg: "bg-emerald-500/10",
                            border: "border-emerald-500/20",
                            badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          };
                        case PHASE_STATUS.IN_PROGRESS:
                          return {
                            icon: <PlayCircle className="h-5 w-5" />,
                            color: "text-amber-400",
                            bg: "bg-amber-500/10",
                            border: "border-amber-500/20",
                            badge: "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          };
                        case PHASE_STATUS.BLOCKED:
                          return {
                            icon: <AlertCircle className="h-5 w-5" />,
                            color: "text-red-400",
                            bg: "bg-red-500/10",
                            border: "border-red-500/20",
                            badge: "bg-red-500/20 text-red-300 border-red-500/30"
                          };
                        default:
                          return {
                            icon: <CircleDot className="h-5 w-5" />,
                            color: "text-gray-400",
                            bg: "bg-gray-500/5",
                            border: "border-gray-500/20",
                            badge: "bg-gray-500/20 text-gray-300 border-gray-500/30"
                          };
                      }
                    };

                    const statusConfig = getPhaseStatusConfig();

                    return (
                      <div
                        key={index}
                        className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${statusConfig.bg} ${statusConfig.border} group`}
                      >
                        {/* Status indicator stripe */}
                        <div className={`absolute top-0 left-0 w-1 h-full ${statusConfig.color.replace('text-', 'bg-')}`} />
                        
                        <div className="p-6 space-y-4">
                          {/* Header Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className={`p-2 rounded-lg ${statusConfig.bg} border ${statusConfig.border}`}>
                                <div className={statusConfig.color}>
                                  {statusConfig.icon}
                                </div>
                              </div>
                              
                              <div className="flex-1 space-y-1">
                                {mode === "edit" ? (
                                  <Input
                                    value={phase.name}
                                    onChange={(e) => {
                                      const updatedPhases = [...formData.phases];
                                      updatedPhases[index] = { ...phase, name: e.target.value };
                                      setFormData({ ...formData, phases: updatedPhases });
                                    }}
                                    className="bg-transparent border-none text-white font-semibold text-lg p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                                    placeholder="Phase name"
                                  />
                                ) : (
                                  <h4 className="text-lg font-semibold text-white">{phase.name}</h4>
                                )}
                                
                                <div className="flex items-center gap-4 text-sm">
                                  <Badge variant="outline" className={`${statusConfig.badge} border`}>
                                    {phase.status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                  </Badge>
                                  <span className="text-gray-400">
                                    Progress: <span className="text-white font-medium">{phase.percentageDone || 0}%</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {mode === "edit" && (
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const updatedPhases = formData.phases.filter((_, i) => i !== index);
                                    setFormData({ ...formData, phases: updatedPhases });
                                  }}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs text-gray-400">
                              <span>Progress</span>
                              <span className="text-gray-500">(calculated from tasks)</span>
                            </div>
                            <div className="relative">
                              <Progress 
                                value={phase.percentageDone || 0} 
                                className="h-2 bg-gray-700/50"
                              />
                            </div>
                          </div>

                          {/* Status and Controls Row */}
                          {mode === "edit" && (
                            <div className="flex items-center gap-4 pt-2 border-t border-gray-500/20">
                              <div className="flex items-center gap-2">
                                <Label className="text-xs text-gray-400 font-medium">Status:</Label>
                                <Select
                                  value={phase.status}
                                  onValueChange={(value) => {
                                    const updatedPhases = [...formData.phases];
                                    updatedPhases[index] = { ...phase, status: value };
                                    setFormData({ ...formData, phases: updatedPhases });
                                  }}
                                >
                                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white h-8 w-36 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-darkGray border-grayBorders">
                                    <SelectItem value={PHASE_STATUS.NOT_STARTED} className="text-white hover:bg-darkGray2">
                                      <div className="flex items-center gap-2">
                                        <CircleDot className="h-3 w-3 text-gray-400" />
                                        Not Started
                                      </div>
                                    </SelectItem>
                                    <SelectItem value={PHASE_STATUS.IN_PROGRESS} className="text-white hover:bg-darkGray2">
                                      <div className="flex items-center gap-2">
                                        <PlayCircle className="h-3 w-3 text-amber-400" />
                                        In Progress
                                      </div>
                                    </SelectItem>
                                    <SelectItem value={PHASE_STATUS.COMPLETED} className="text-white hover:bg-darkGray2">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-emerald-400" />
                                        Completed
                                      </div>
                                    </SelectItem>
                                    <SelectItem value={PHASE_STATUS.BLOCKED} className="text-white hover:bg-darkGray2">
                                      <div className="flex items-center gap-2">
                                        <AlertCircle className="h-3 w-3 text-red-400" />
                                        Blocked
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}

                          {/* Notes Section */}
                          {(phase.note || mode === "edit") && (
                            <div className="space-y-2 pt-2 border-t border-gray-500/20">
                              <Label className="text-xs text-gray-400 font-medium">Notes</Label>
                              {mode === "edit" ? (
                                <Textarea
                                  value={phase.note || ""}
                                  onChange={(e) => {
                                    const updatedPhases = [...formData.phases];
                                    updatedPhases[index] = { ...phase, note: e.target.value };
                                    setFormData({ ...formData, phases: updatedPhases });
                                  }}
                                  className="bg-gray-800/50 border-gray-600 text-white text-sm min-h-[80px] resize-none focus:border-blue-500"
                                  placeholder="Add notes about this phase..."
                                />
                              ) : (
                                phase.note && (
                                  <p className="text-sm text-gray-300 bg-gray-800/30 p-3 rounded-lg border border-gray-600/50">
                                    {phase.note}
                                  </p>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-800/20 border-2 border-dashed border-gray-600/50 rounded-xl">
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto bg-gray-700/50 rounded-full flex items-center justify-center">
                      <Layers className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-300">No phases defined</h4>
                      <p className="text-sm text-gray-500 mt-1">Break down your project into manageable phases</p>
                    </div>
                    {mode === "edit" && (
                      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                        <Button
                          onClick={() => {
                            const newPhase = {
                              name: "New Phase",
                              status: PHASE_STATUS.NOT_STARTED,
                              percentageDone: 0,
                              note: "",
                            };
                            setFormData({ ...formData, phases: [...formData.phases, newPhase] });
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Custom Phase
                        </Button>
                        <Button
                          onClick={() => {
                            const defaultPhases = [
                              { name: "Planning", status: PHASE_STATUS.NOT_STARTED, percentageDone: 0, note: "" },
                              { name: "Design", status: PHASE_STATUS.NOT_STARTED, percentageDone: 0, note: "" },
                              { name: "Development", status: PHASE_STATUS.NOT_STARTED, percentageDone: 0, note: "" },
                              { name: "Testing/QA", status: PHASE_STATUS.NOT_STARTED, percentageDone: 0, note: "" },
                              { name: "Deployment", status: PHASE_STATUS.NOT_STARTED, percentageDone: 0, note: "" },
                            ];
                            setFormData({ ...formData, phases: defaultPhases });
                          }}
                          variant="outline"
                          className="text-gray-300 border-gray-600 hover:bg-gray-700/50"
                        >
                          <Layers className="h-4 w-4 mr-2" />
                          Add Default Phases
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
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