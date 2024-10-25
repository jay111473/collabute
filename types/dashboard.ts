export interface Project {
  id: string;
  title: string;
  description: string;
  issues: Issue[];
  requests: Request[];
  status: string;
  budget: number;
  updatedAt: string;
}

export interface User {
  id: number;
  name?: string;
  email?: string;
}

export interface Issue {
  id: string;
  title: string;
  status: string;
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
