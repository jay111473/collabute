export interface Industry {
  label: string;
  value: string;
}

export type ProjectType = 'existing' | 'new';

export type ProjectScope = 'full' | 'partial' | 'unknown';

export interface ProjectPlatform {
  label: string;
  value: string;
  description?: string;
  scopes: ProjectScope[];
  category?: 'web' | 'mobile' | 'desktop' | 'ai' | 'unknown';
  isCore?: boolean; // Whether this platform is essential for the project type
  suggestedFor?: string[]; // Array of project descriptions/keywords that suggest this platform
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

export interface Feature {
  title: string;
  description: string;
  estimatedPrice: string;
  platform: "website" | "ios" | "android" | "desktop" | "pwa" | "rest-api" | "graphql-api" | "database" | "auth-service" | "file-storage" | "real-time" | "ai-service" | "payment-service";
  isCore?: boolean;
  order?: number; // Implementation order, lower numbers should be implemented first
}

export interface ProjectInfo {
  name: string;
  description: string;
  industries: string[];
  projectPlatforms: {
    value: string;
    isCore?: boolean;
  }[];
}

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

export interface Competitor {
  name: string;
  url: string;
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
