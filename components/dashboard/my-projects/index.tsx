"use client";

import { Project } from "@/types/dashboard";
import MyProjectCard from "../projects";
import { EmptyState } from "./EmptyState";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { CheckCircle, Clock, Pause, Calendar, FolderOpen, Search, TimerIcon, AlertTriangle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectSummaryBoxProps {
  title: string;
  count: number;
  subtitle?: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  variant?: 'default' | 'warning' | 'danger' | 'success';
}

const ProjectSummaryBox = ({ 
  title, 
  count, 
  subtitle, 
  icon, 
  isSelected, 
  onClick,
  variant = 'default'
}: ProjectSummaryBoxProps) => {
  const variantStyles = {
    default: 'border-grayBorders hover:border-gray-500',
    warning: 'border-grayBorders hover:border-gray-500',
    danger: 'border-grayBorders hover:border-gray-500',
    success: 'border-grayBorders hover:border-gray-500'
  };

  const selectedStyles = {
    default: 'border-blue-400',
    warning: 'border-[#F5C78B]',
    danger: 'border-[#F58B9B]',
    success: 'border-[#99D5A8]'
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col gap-3 p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 bg-darkGray min-h-[120px]",
        isSelected ? selectedStyles[variant] : variantStyles[variant]
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-sm font-medium",
            {
              default: "text-blue-400",
              warning: "text-[#F5C78B]",
              danger: "text-[#F58B9B]",
              success: "text-[#99D5A8]",
            }[variant]
          )}
        >
          {title}
        </span>
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-white text-2xl font-bold">{count}</span>
        {subtitle && (
          <span className="text-gray-400 text-sm">{subtitle}</span>
        )}
      </div>
    </div>
  );
};

/**
 * MyProjectsComponent displays a user's projects and issues
 * Shows an empty state when no projects exist
 */
const MyProjectsComponent = ({
  projects,
}: {
  projects: Project[];
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");

  const sortOptions = [
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "Progress", value: "progress" },
    { label: "Budget", value: "budget" },
  ];

  // Calculate project counts by status
  const projectCounts = useMemo(() => {
    const counts = {
      planned: 0,
      'in-progress': 0,
      completed: 0,
      'on-hold': 0,
    };

    projects.forEach(project => {
      if (project.status in counts) {
        counts[project.status as keyof typeof counts]++;
      }
    });

    return counts;
  }, [projects]);

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects?.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus
        ? project.status === selectedStatus
        : true;
      
      return matchesSearch && matchesStatus;
    }) || [];

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "oldest":
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case "progress":
          // Sort by completion percentage (assuming we can calculate this)
          return 0; // Placeholder for progress sorting
        case "budget":
          return (b.budget || 0) - (a.budget || 0);
        default:
          return 0;
      }
    });
  }, [projects, searchQuery, selectedStatus, sortBy]);

  const hasProjects = projects.length > 0;

  // If user has no projects and no issues, show the main empty state
  if (!hasProjects) {
    return (
      <div className="flex flex-col w-full bg-black">
        <main className="flex flex-1 flex-col">
          <EmptyState />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-black">
      <main className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        {/* Search and Sort Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 flex items-center gap-x-2 px-4 bg-darkGray rounded-[18px] py-3">
            <div className="flex items-center pointer-events-none z-10">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <Input
              className="p-0 text-white placeholder:text-gray-400 placeholder:bg-darkGray border-none outline-none placeholder:border-none focus:border-none focus:bg-darkGray focus:outline-none focus:ring-0 w-full"
              placeholder="Search Projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
                     <Select value={sortBy} onValueChange={setSortBy}>
             <SelectTrigger className="rounded-full font-medium text-sm cursor-pointer !py-4 px-3 flex items-center gap-x-[6px] w-max bg-darkGray border-grayBorders text-white">
               <div className="flex items-center gap-2 h-full">
                 <TimerIcon className="w-4 h-4 text-white" />
                 <span className="text-sm text-white">Sort:</span>
                 <SelectValue className="text-sm text-white" placeholder="Sort by" />
               </div>
             </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Project Summary Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ProjectSummaryBox
            title="Planned"
            count={projectCounts.planned}
            icon={<Calendar className="w-5 h-5 text-blue-400" />}
            isSelected={selectedStatus === "planned"}
            onClick={() => setSelectedStatus(selectedStatus === "planned" ? null : "planned")}
            variant="default"
          />
          <ProjectSummaryBox
            title="In Progress"
            count={projectCounts['in-progress']}
            subtitle={projectCounts['in-progress'] > 0 ? "Active development" : undefined}
            icon={<Clock className="w-5 h-5" style={{ color: '#F5C78B' }} />}
            isSelected={selectedStatus === "in-progress"}
            onClick={() => setSelectedStatus(selectedStatus === "in-progress" ? null : "in-progress")}
            variant="warning"
          />
          <ProjectSummaryBox
            title="On Hold"
            count={projectCounts['on-hold']}
            subtitle={projectCounts['on-hold'] > 0 ? "Temporarily paused" : undefined}
            icon={<Pause className="w-5 h-5" style={{ color: '#F58B9B' }} />}
            isSelected={selectedStatus === "on-hold"}
            onClick={() => setSelectedStatus(selectedStatus === "on-hold" ? null : "on-hold")}
            variant="danger"
          />
          <ProjectSummaryBox
            title="Completed"
            count={projectCounts.completed}
            subtitle={projectCounts.completed > 0 ? "Successfully delivered" : undefined}
            icon={<CheckCircle className="w-5 h-5" style={{ color: '#99D5A8' }} />}
            isSelected={selectedStatus === "completed"}
            onClick={() => setSelectedStatus(selectedStatus === "completed" ? null : "completed")}
            variant="success"
          />
        </div>

        {/* Projects List */}
        {filteredAndSortedProjects.length === 0 && (searchQuery || selectedStatus) ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <FolderOpen className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">No matching projects found</p>
            <p className="text-sm">
              Try adjusting your search criteria or filters
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredAndSortedProjects.map((project) => (
              <MyProjectCard
                key={project.id}
                project={project}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyProjectsComponent;
