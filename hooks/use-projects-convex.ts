"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { Project } from "@/types/dashboard";

// Type for the populated project data returned by Convex queries
type PopulatedProject = Doc<"projects"> & {
  owner?: any; // Populated user data
  teamLead?: any; // Populated team lead data  
  repository?: any; // Populated repository data
  issueCount?: number; // Count of issues
  collaboratorCount?: number; // Count of collaborators
};

// Transform Convex populated project to legacy Project type for backward compatibility
function transformProject(doc: PopulatedProject): Project {
  return {
    id: doc._id as any, // Convert Convex ID to number-like
    title: doc.title,
    owner: doc.owner ? {
      id: doc.owner._id as any,
      name: doc.owner.name,
      email: doc.owner.email,
      ...doc.owner
    } : null,
    slug: doc.slug || null,
    description: doc.description,
    longDescription: null, // Complex nested structure - simplified for now
    logo: null, // Could be implemented with logoUrl
    projectType: (doc.type as any) || null,
    status: (doc.status as any) || "planned",
    milestones: doc.milestones || {
      ideaRefinement: "not-started",
      documentation: "not-started",
      design: "not-started",
      development: "not-started",
      testing: "not-started",
      launch: "not-started",
      maintenance: "not-started",
      scaling: "not-started",
    },
    tags: doc.tags?.map((tag) => ({ tag, id: tag })) || null,
    startDate: new Date(doc.startDate).toISOString(),
    endDate: doc.endDate ? new Date(doc.endDate).toISOString() : null,
    budget: doc.budget || null,
    lead: doc.teamLead ? {
      id: doc.teamLead._id as any,
      name: doc.teamLead.name,
      ...doc.teamLead
    } : null,
    collabuters: null, // Could be populated with collaboratorCount data
    stacks: doc.stacks?.map((stack) => stack as any) || null, // Simplified stack mapping
    issues: doc.issueCount ? Array(doc.issueCount).fill({ id: 1 }) : null, // Placeholder
    projectState: (doc.status as any) || "draft",
    updatedAt: new Date(doc._creationTime).toISOString(),
    createdAt: new Date(doc._creationTime).toISOString(),
  };
}

interface UseProjectsOptions {
  page?: number;
  limit?: number;
  type?: "startup" | "developer";
  status?: "active" | "completed" | "pending";
  ownerId?: Id<"user">;
  where?: Record<string, any>;
}

export function useProjectsConvex(options: UseProjectsOptions = {}): {
  projects: Project[];
  totalPages: number;
  currentPage: number;
  totalProjects: number;
  loading: boolean;
  error: null;
  refetch: () => void;
} {
  const { page = 1, limit = 10, type, status, ownerId } = options;

  const result = useQuery(api.projects.getProjects, {
    page,
    limit,
    type,
    status,
    ownerId,
  });

  return {
    projects: result?.projects ? result.projects.map(transformProject) : [],
    totalPages: result?.totalPages || 0,
    currentPage: result?.currentPage || 1,
    totalProjects: result?.totalProjects || 0,
    loading: result === undefined,
    error: null,
    refetch: () => {
      // Convex automatically refetches when dependencies change
      // For manual refetch, we'd need to implement cache invalidation
    },
  };
}

export function useProjectBySlug(slug: string): {
  project: Project | undefined;
  loading: boolean;
  error: null;
} {
  const project = useQuery(api.projects.getProjectBySlug, { slug });

  return {
    project: project ? transformProject(project) : undefined,
    loading: project === undefined,
    error: null,
  };
}

// Backward compatibility with existing hook interface
export function useProjectsData(options: UseProjectsOptions = {}) {
  return useProjectsConvex(options);
}
