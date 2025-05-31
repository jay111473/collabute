import {
  Globe,
  Smartphone,
  Monitor,
  Brain,
  Database,
  Lock,
  FileText,
  Zap,
  CreditCard,
  Server,
} from "lucide-react";

// Platform type definition
export type PlatformType = 
  | "website" 
  | "ios" 
  | "android" 
  | "desktop" 
  | "pwa" 
  | "rest-api" 
  | "graphql-api" 
  | "database" 
  | "auth-service" 
  | "file-storage" 
  | "real-time" 
  | "ai-service" 
  | "payment-service";

// Platform categories
export type PlatformCategory = "frontend" | "backend";

// Platform configuration
export interface PlatformConfig {
  label: string;
  color: string;
  category: PlatformCategory;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

// Platform configurations mapping
export const PLATFORM_CONFIGS: Record<PlatformType, PlatformConfig> = {
  // Frontend Platforms
  website: {
    label: "Website",
    color: "from-blue-500 to-blue-600",
    category: "frontend",
    icon: Globe,
    iconColor: "text-blue-400",
  },
  ios: {
    label: "iOS App",
    color: "from-gray-400 to-gray-500",
    category: "frontend",
    icon: Smartphone,
    iconColor: "text-gray-300",
  },
  android: {
    label: "Android App",
    color: "from-green-500 to-green-600",
    category: "frontend",
    icon: Smartphone,
    iconColor: "text-green-400",
  },
  desktop: {
    label: "Desktop App",
    color: "from-purple-500 to-purple-600",
    category: "frontend",
    icon: Monitor,
    iconColor: "text-purple-400",
  },
  pwa: {
    label: "PWA",
    color: "from-indigo-500 to-indigo-600",
    category: "frontend",
    icon: Globe,
    iconColor: "text-indigo-400",
  },
  // Backend Platforms
  "rest-api": {
    label: "REST API",
    color: "from-green-400 to-green-500",
    category: "backend",
    icon: Server,
    iconColor: "text-green-400",
  },
  "graphql-api": {
    label: "GraphQL API",
    color: "from-pink-400 to-pink-500",
    category: "backend",
    icon: Server,
    iconColor: "text-pink-400",
  },
  database: {
    label: "Database",
    color: "from-blue-400 to-blue-500",
    category: "backend",
    icon: Database,
    iconColor: "text-blue-400",
  },
  "auth-service": {
    label: "Authentication",
    color: "from-yellow-400 to-yellow-500",
    category: "backend",
    icon: Lock,
    iconColor: "text-yellow-400",
  },
  "file-storage": {
    label: "File Storage",
    color: "from-orange-400 to-orange-500",
    category: "backend",
    icon: FileText,
    iconColor: "text-orange-400",
  },
  "real-time": {
    label: "Real-time",
    color: "from-red-400 to-red-500",
    category: "backend",
    icon: Zap,
    iconColor: "text-red-400",
  },
  "ai-service": {
    label: "AI Service",
    color: "from-yellow-500 to-yellow-600",
    category: "backend",
    icon: Brain,
    iconColor: "text-yellow-400",
  },
  "payment-service": {
    label: "Payment Service",
    color: "from-green-500 to-green-600",
    category: "backend",
    icon: CreditCard,
    iconColor: "text-green-500",
  },
};

// Utility functions
export const getPlatformLabel = (platform: string): string => {
  const config = PLATFORM_CONFIGS[platform as PlatformType];
  return config?.label || platform.charAt(0).toUpperCase() + platform.slice(1);
};

export const getPlatformColor = (platform: string): string => {
  const config = PLATFORM_CONFIGS[platform as PlatformType];
  return config?.color || "from-gray-500 to-gray-600";
};

export const getPlatformCategory = (platform: string): PlatformCategory | undefined => {
  const config = PLATFORM_CONFIGS[platform as PlatformType];
  return config?.category;
};

export const getPlatformIcon = (platform: string): React.ComponentType<{ className?: string }> => {
  const config = PLATFORM_CONFIGS[platform as PlatformType];
  return config?.icon || Globe;
};

export const getPlatformIconColor = (platform: string): string => {
  const config = PLATFORM_CONFIGS[platform as PlatformType];
  return config?.iconColor || "text-gray-400";
};

// Platform Icon Component
interface PlatformIconProps {
  platform: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  useDefaultColor?: boolean;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({ 
  platform, 
  className = "", 
  size = "md",
  useDefaultColor = false
}) => {
  const IconComponent = getPlatformIcon(platform);
  const iconColor = getPlatformIconColor(platform);
  
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5",
  };
  
  const finalClassName = useDefaultColor 
    ? `${sizeClasses[size]} ${className}` 
    : `${sizeClasses[size]} ${iconColor} ${className}`;
  
  return <IconComponent className={finalClassName} />;
};

// Platform Badge Component
interface PlatformBadgeProps {
  platform: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({
  platform,
  showLabel = true,
  size = "md",
  className = "",
}) => {
  const color = getPlatformColor(platform);
  const label = getPlatformLabel(platform);
  
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };
  
  const iconSizes = {
    sm: "sm" as const,
    md: "sm" as const,
    lg: "md" as const,
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-md flex items-center justify-center bg-gradient-to-br ${color}`}
      >
        <PlatformIcon 
          platform={platform} 
          className="text-white" 
          size={iconSizes[size]}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium">{label}</span>
      )}
    </div>
  );
};

// Get platforms by category
export const getPlatformsByCategory = (category: PlatformCategory): PlatformType[] => {
  return Object.entries(PLATFORM_CONFIGS)
    .filter(([_, config]) => config.category === category)
    .map(([platform]) => platform as PlatformType);
};

// Check if platform exists
export const isPlatformValid = (platform: string): platform is PlatformType => {
  return platform in PLATFORM_CONFIGS;
};

// Get all frontend platforms
export const getFrontendPlatforms = (): PlatformType[] => {
  return getPlatformsByCategory("frontend");
};

// Get all backend platforms  
export const getBackendPlatforms = (): PlatformType[] => {
  return getPlatformsByCategory("backend");
}; 