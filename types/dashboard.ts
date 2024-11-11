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
  name: string;
  profilePicture?: (number | null) | Media;
  type: "developer" | "startup";
  phoneNumber?: string | null;
  role?: ("admin" | "user") | null;
  githubId?: string | null;
  wallet?: number | null;
  developerFields?: {
    bio?: string | null;
    issues?: (number | Issue)[] | null;
    totalPayment?: number | null;
    payments?:
      | {
          paymentDate?: string | null;
          paymentAmount?: number | null;
          paymentType?: ("income" | "withdrawal" | "tip") | null;
          paymentMethod?: string | null;
          paymentStatus?: ("pending" | "completed" | "failed") | null;
          paymentReference?: string | null;
          paymentDescription?: string | null;
          id?: string | null;
        }[]
      | null;
    dateJoined?: string | null;
    profilePicture?: (number | null) | Media;
    skills?:
      | {
          skill?: string | null;
          id?: string | null;
        }[]
      | null;
    experienceLevel?:
      | ("junior" | "mid_level" | "senior" | "lead" | "architect")
      | null;
    githubProfile?: string | null;
    linkedinProfile?: string | null;
    personalWebsite?: string | null;
    primaryRole?:
      | (
          | "Frontend Developer"
          | "Backend Developer"
          | "Full Stack Developer"
          | "Mobile Developer"
          | "DevOps Engineer"
          | "Data Scientist"
          | "UI/UX Designer"
          | "QA Engineer"
          | "Other"
        )
      | null;
    availability?:
      | ("full_time" | "part_time" | "contract" | "freelance" | "not_available")
      | null;
    preferredWorkType?: ("remote" | "on_site" | "hybrid") | null;
    education?:
      | {
          degree?: string | null;
          institution?: string | null;
          graduationYear?: number | null;
          id?: string | null;
        }[]
      | null;
    languages?:
      | {
          language?: string | null;
          proficiency?:
            | ("Beginner" | "Intermediate" | "Advanced" | "Native")
            | null;
          id?: string | null;
        }[]
      | null;
    hourlyRate?: number | null;
    preferredProjectDuration?:
      | (
          | "Less than 1 month"
          | "1-3 months"
          | "3-6 months"
          | "6-12 months"
          | "More than 12 months"
        )
      | null;
  };
  startupFields?: {
    companyName?: string | null;
    description?: string | null;
    foundingDate?: string | null;
    cto?: (number | null) | User;
    fundingInformation?: {
      fundingStage?:
        | ("Pre-seed" | "Seed" | "Series A" | "Series B" | "Series C+")
        | null;
      totalFundingRaised?: number | null;
      lastFundingDate?: string | null;
    };
    teamSize?: ("1-10" | "10-50" | "50-100" | "+100") | null;
    productStage?:
      | ("Idea" | "Prototype" | "MVP" | "Beta" | "Launched" | "Growth")
      | null;
  };
  website?: string | null;
  contactInformation?: {
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  projects?: (number | Project)[] | null;
  sub?: string | null;
  updatedAt: string;
  createdAt: string;
  email: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiration?: string | null;
  salt?: string | null;
  hash?: string | null;
  loginAttempts?: number | null;
  lockUntil?: string | null;
  password?: string | null;
}

export interface Media {
  id: number;
  alt: string;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: string;
  budget: number;
  createdAt: string;
  isBookmarked?: boolean;
  requests: Request[];
  onboardingVideo: {
    url: string;
    name: string;
  };
  onboardingVideoThumbnail: {
    url: string;
    name: string;
  };
  onboardingVideoLink: string;
  priority: string;
  assignee?: {
    name: string;
  };
  videoId?: string; // Optional YouTube video ID
  videoUrl?: string; // Optional YouTube video URL
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

export type ProjectType = "normal" | "urgent" | "featured" | "trending";
