export interface Project {
  id: string;
  title: string;
  description: string;
  slug: string;
  issues: Issue[];
  stacks: Stacks[];
  requests: Request[];
  status: string;
  budget: number;
  updatedAt: string;
  projectType: ProjectType;
}

export interface Stacks {
  id: string;
  name: string;
}

export interface User {
  id: number;
  name?: string;
  email?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: string;
  budget: number;
  requests: Request[];
  priority: string;
  assignee?: {
    name: string;
  };
}

export type RequestType = "feature" | "bug";
export type RequestPriority = "low" | "medium" | "high";
export type RequestStatus = "pending" | "in_progress" | "completed";

export interface Request {
  id?: string | null;
  requestTitle?: string | null;
  requestDescription?: string | null;
  requestType?: RequestType | null;
  requestPriority?: RequestPriority | null;
  requestAssignee?: number | User | null;
  requestStatus?: RequestStatus | null;
}

export interface DashboardData {
  wallet: number;
  projects?: Project[];
  developerFields?: {
    issues?: Issue[];
    totalPayment?: number;
  };
}

export type ProjectType = 'normal' | 'urgent' | 'featured' | 'trending';
