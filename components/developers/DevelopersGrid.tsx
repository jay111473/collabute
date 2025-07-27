import { FC } from "react";
import DeveloperCard from "./DeveloperCard";
import { User } from "@/types/convex";

// Type for developer with profile data
type DeveloperWithProfile = User & {
  developerProfile: {
    bio?: string;
    skills?: string[];
    experience?: number;
    experienceLevel?: string;
    availability?: string;
    hourlyRate?: number;
    portfolio?: string[];
  } | null;
  githubProfile: {
    githubUsername: string;
    publicRepos?: number;
    followers?: number;
  } | null;
  repositoriesCount: number;
  issuesWorkedOn: number;
};

interface DeveloperGridProps {
  developers: DeveloperWithProfile[];
  isLoading: boolean;
  variant?: "featured" | "compact";
}

/**
 * Grid component to display developer cards
 * Handles loading states and empty states
 */
export const DeveloperGrid: FC<DeveloperGridProps> = ({
  developers,
  isLoading,
  variant = "compact",
}) => {
  if (isLoading) {
    const gridCols =
      variant === "featured"
        ? "grid-cols-1 md:grid-cols-3"
        : "grid-cols-1 md:grid-cols-2";

    return (
      <div className={`grid ${gridCols} gap-6`}>
        {Array.from({ length: variant === "featured" ? 3 : 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-darkGray border-none p-8 rounded-2xl animate-pulse"
          >
            {variant === "featured" ? (
              <>
                <div className="aspect-[4/3] bg-[#222] mb-4 rounded-lg" />
                <div className="h-6 w-40 bg-[#222] mb-2 rounded-md" />
                <div className="h-4 w-32 bg-[#222] mb-4 rounded-md" />
                <div className="h-4 w-28 bg-[#222] rounded-md" />
              </>
            ) : (
              <div className="flex items-start gap-4 mb-8">
                <div className="h-16 w-16 rounded-full bg-[#222]" />
                <div>
                  <div className="h-6 w-40 bg-[#222] mb-2 rounded-md" />
                  <div className="h-6 w-56 bg-[#222] rounded-full" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (developers.length === 0) {
    return (
      <div className="col-span-full text-center py-10">
        <p className="text-gray-400">
          No developers found matching your criteria.
        </p>
      </div>
    );
  }

  const gridCols =
    variant === "featured"
      ? "grid-cols-1 md:grid-cols-3"
      : "grid-cols-1 md:grid-cols-2";

  return (
    <div className={`grid ${gridCols} gap-6`}>
      {developers.map((developer) => (
        <DeveloperCard
          key={developer._id}
          developer={developer}
          variant={variant}
        />
      ))}
    </div>
  );
};
