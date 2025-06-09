// Core wizard types
export type ProjectType = 'existing' | 'new';
export type ProjectScope = 'full' | 'partial' | 'unknown';

// Industry and platform types
export interface Industry {
  label: string;
  value: string;
}

export interface ProjectPlatform {
  label: string;
  value: string;
  description?: string;
  scopes: ProjectScope[];
  category?: 'web' | 'mobile' | 'desktop' | 'ai' | 'unknown';
  isCore?: boolean;
  suggestedFor?: string[];
}

export type ProjectSide = 
  | 'frontend'
  | 'backend'
  | 'ios'
  | 'android'
  | 'ai'
  | 'devops'
  | 'windows'
  | 'macos'
  | 'linux'
  | 'cross-platform';

// Project information types
export interface ProjectInfo {
  idea: string;
  originalIdea?: string;
  name: string;
  description: string;
  industries: string[];
  projectPlatforms: {
    value: string;
    isCore?: boolean;
  }[];
}

// Feature and comparison types
export interface Feature {
  name: string;
  title?: string; // For backward compatibility
  description: string;
  icon: string; // Required for components
  estimatedPrice?: string;
  platform?: "website" | "ios" | "android" | "desktop" | "pwa" | "rest-api" | "graphql-api" | "database" | "auth-service" | "file-storage" | "real-time" | "ai-service" | "payment-service";
  isCore?: boolean;
  order?: number;
}

// Business-specific types for business comparison
export interface BusinessAspect {
  name: string;
  description: string;
  icon: string;
}

export interface BusinessCategory {
  name: string;
  features: BusinessAspect[];
}

export interface BusinessCompetitor {
  name: string;
  url: string;
  type: "Market Leader" | "Innovative Startup" | "Enterprise Solution" | "Budget Option" | "Niche Player";
  description: string;
  features: Record<string, boolean>;
}

export interface UserBusinessProject {
  name: string;
  features: Record<string, boolean>;
}

export interface Category {
  name: string;
  features: Feature[];
}

export interface Competitor {
  name: string;
  url: string;
  type?: "Market Leader" | "Innovative Startup" | "Enterprise Solution" | "Budget Option" | "Niche Player";
  description?: string;
  features?: Record<string, boolean>;
}

export interface FeatureComparisonData {
  categories: Category[];
  competitors: Competitor[];
  userProject: {
    name: string;
    features: Record<string, boolean>;
  };
}

export interface BusinessComparisonData {
  categories: BusinessCategory[];
  competitors: BusinessCompetitor[];
  userProject: UserBusinessProject;
}

// Project generation types
export interface ProjectPhase {
  name: string;
  durationInWeeks: number;
  description: string;
}

export interface ResourceRequirements {
  teamSize: number;
  skillLevel: "junior" | "mid" | "senior";
  specializations: string[];
}

export interface ParallelizationOpportunity {
  projectIds: string[];
  trackIds?: string[]; // For track-based parallelization
  description: string;
}

export interface GeneratedProject {
  id: string;
  name: string;
  platform: string;
  framework: string;
  language: string;
  estimatedTimeline: string; // For backward compatibility
  durationInWeeks: number;
  priority: "high" | "medium" | "low";
  dependencies: string[];
  resourceRequirements: ResourceRequirements;
  phases: ProjectPhase[];
  deliverables: string[];
}

export interface ProjectsResponse {
  projects: GeneratedProject[];
  totalEstimatedDuration: number;
  criticalPath: string[];
  parallelizationOpportunities: ParallelizationOpportunity[];
}

// Track types
export interface ProjectTrack {
  id: string;
  name: string;
  category: 
    | "product-planning"
    | "ui-ux-design" 
    | "web-development"
    | "ios-development"
    | "android-development"
    | "backend-development"
    | "api-development"
    | "database-development"
    | "devops-deployment"
    | "qa-testing"
    | "integration-testing"
    | "security-testing";
  platform?: string;
  startWeek: number;
  durationInWeeks: number;
  endWeek: number;
  dependencies?: string[];
  canParallelize?: boolean;
}

export interface PlatformAnalysis {
  requiredPlatforms: Array<{
    platform: string;
    priority: "high" | "medium" | "low";
    reasoning: string;
  }>;
  estimatedComplexity: "simple" | "moderate" | "complex" | "enterprise";
  recommendedApproach: string;
}

export interface TracksResponse {
  platformAnalysis: PlatformAnalysis;
  tracks: ProjectTrack[];
  totalEstimatedDuration: number;
  criticalPath: string[];
  parallelizationOpportunities: Array<{
    trackIds: string[];
    description: string;
  }>;
}

// Team and lead types
export interface Stack {
  id: number;
  name: string;
  description?: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  status: string;
  updatedAt: string;
  createdAt: string;
}

export interface Lead {
  id: number;
  name: string;
  experience: number;
  stack: (number | Stack)[];
  projects?: (number | Project)[] | null;
  availability?: boolean | null;
  updatedAt: string;
  createdAt: string;
}

// GitHub integration types
export interface GitHubRepository {
  repoId: string;
  name: string;
  fullName: string;
  url: string;
  isPrivate: boolean;
  description?: string;
  language?: string;
  defaultBranch?: string;
}

// Task types for track breakdown
export interface Task {
  id: string;
  name: string;
  description: string;
  estimatedHours: number;
  priority: "high" | "medium" | "low";
  skillLevel: "junior" | "mid" | "senior";
  dependencies: string[]; // Task IDs this depends on
  deliverables: string[];
  acceptanceCriteria: string[];
  tags: string[]; // Technology tags, skill tags, etc.
}

export interface TrackTasks {
  trackId: string;
  trackName: string;
  trackCategory: string;
  platform?: string;
  tasks: Task[];
  totalEstimatedHours: number;
  criticalTasks: string[]; // Task IDs on critical path
  parallelTaskGroups: Array<{
    taskIds: string[];
    description: string;
  }>;
  requiredSkills: string[];
}

export interface TrackTasksResponse {
  trackTasks: TrackTasks[];
  overallSummary: {
    totalTasks: number;
    totalEstimatedHours: number;
    averageTaskComplexity: "simple" | "moderate" | "complex";
    crossTrackDependencies: Array<{
      fromTrackId: string;
      toTrackId: string;
      description: string;
    }>;
  };
  recommendations: {
    developmentApproach: string;
    riskMitigation: string[];
    qualityAssurance: string[];
  };
}

// Main wizard data type
export interface WizardData {
  projectType: ProjectType | null;
  projectInfo: ProjectInfo | null;
  competitors: Competitor[];
  featureComparison: FeatureComparisonData | null;
  businessComparison: BusinessComparisonData | null;
  projects: GeneratedProject[];
  tracks: ProjectTrack[];
  tracksResponse: TracksResponse | null;
  trackTasks: TrackTasksResponse | null;
  leader: Lead | null;
  githubRepository: GitHubRepository | null;
}

// Hook return types
export interface UseWizardAiReturn {
  isLoading: boolean;
  suggestedIndustries: Industry[];
  suggestedCompetitors: Competitor[];
  suggestedProjects: GeneratedProject[];
  suggestedTracks: ProjectTrack[];
  totalEstimatedDuration: number;
  criticalPath: string[];
  parallelizationOpportunities: ParallelizationOpportunity[];
  fetchFeatureComparison: (projectIdea: string) => Promise<FeatureComparisonData | null>;
  fetchBusinessComparison: (projectIdea: string) => Promise<BusinessComparisonData | null>;
  fetchProjects: (projectInfo: any) => Promise<ProjectsResponse | null>;
  fetchTracks: (
    projectInfo: any,
    competitors: Competitor[],
    projects: GeneratedProject[]
  ) => Promise<TracksResponse | null>;
  resetSuggestions: () => void;
}

// Platform constants
export const PROJECT_PLATFORMS: ProjectPlatform[] = [
  {
    label: 'Frontend Application',
    value: 'frontend',
    description: 'A user interface application that runs in web browsers, focusing on what users see and interact with. Typically built with technologies like React, Vue, or Angular.',
    scopes: ['partial'],
    category: 'web',
    isCore: true,
    suggestedFor: ['web', 'ecommerce', 'dashboard', 'admin', 'portal', 'website', 'cms']
  },
  {
    label: 'Backend Application',
    value: 'backend',
    description: 'A server-side application that handles business logic, data storage, and processing. Built with technologies like Node.js, Python, Java, etc.',
    scopes: ['partial'],
    category: 'web',
    isCore: true,
    suggestedFor: ['api', 'database', 'server', 'ecommerce', 'dashboard', 'admin', 'authentication']
  },
  {
    label: 'Full Stack Application',
    value: 'fullstack',
    description: 'A complete application that includes both frontend and backend components, providing end-to-end functionality.',
    scopes: ['full'],
    category: 'web',
    isCore: true,
    suggestedFor: ['web', 'ecommerce', 'dashboard', 'admin', 'portal']
  },
  {
    label: 'iOS Application',
    value: 'ios',
    description: 'Native mobile applications specifically for Apple iOS devices (iPhone, iPad) using Swift or Objective-C.',
    scopes: ['partial', 'full'],
    category: 'mobile',
    suggestedFor: ['mobile', 'app', 'ecommerce', 'social']
  },
  {
    label: 'Android Application',
    value: 'android',
    description: 'Native mobile applications specifically for Android devices using Kotlin or Java.',
    scopes: ['partial', 'full'],
    category: 'mobile',
    suggestedFor: ['mobile', 'app', 'ecommerce', 'social']
  },
  {
    label: 'Cross-Platform Mobile',
    value: 'cross-platform-mobile',
    description: 'Mobile applications that run on both iOS and Android using frameworks like React Native or Flutter.',
    scopes: ['full'],
    category: 'mobile',
    suggestedFor: ['mobile', 'app', 'ecommerce', 'social']
  },
  {
    label: 'Windows Application',
    value: 'windows',
    description: 'Native applications specifically for Windows operating system.',
    scopes: ['partial', 'full'],
    category: 'desktop',
    suggestedFor: ['desktop', 'windows', 'application']
  },
  {
    label: 'macOS Application',
    value: 'macos',
    description: 'Native applications specifically for macOS operating system.',
    scopes: ['partial', 'full'],
    category: 'desktop',
    suggestedFor: ['desktop', 'macos', 'application']
  },
  {
    label: 'Cross-Platform Desktop',
    value: 'cross-platform-desktop',
    description: 'Desktop applications that run on Windows, macOS, and Linux using frameworks like Electron or Tauri.',
    scopes: ['full'],
    category: 'desktop',
    suggestedFor: ['desktop', 'application', 'cross-platform']
  },
  {
    label: 'AI/ML Application',
    value: 'ai',
    description: 'Applications focused on artificial intelligence, machine learning, or data science capabilities.',
    scopes: ['partial', 'full'],
    category: 'ai',
    suggestedFor: ['ai', 'ml', 'machine learning', 'data science', 'analytics', 'prediction']
  }
];
