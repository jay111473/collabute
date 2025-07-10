import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32 bg-gray-700" />
        <Skeleton className="h-5 w-64 bg-gray-700" />
      </div>

      {/* Profile Card */}
      <div className="bg-darkGray rounded-lg p-6">
        <div className="flex items-center gap-6 mb-6">
          {/* Avatar */}
          <Skeleton className="h-20 w-20 rounded-full bg-gray-700" />
          
          {/* Profile Info */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 bg-gray-700" />
            <Skeleton className="h-4 w-32 bg-gray-700" />
            <Skeleton className="h-4 w-40 bg-gray-700" />
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 bg-gray-700" />
            <Skeleton className="h-10 w-full bg-gray-700" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 bg-gray-700" />
            <Skeleton className="h-10 w-full bg-gray-700" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 bg-gray-700" />
            <Skeleton className="h-10 w-full bg-gray-700" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 bg-gray-700" />
            <Skeleton className="h-10 w-full bg-gray-700" />
          </div>
        </div>

        <div className="mt-6">
          <Skeleton className="h-10 w-32 bg-gray-700" />
        </div>
      </div>

      {/* Additional Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Skills/Experience */}
        <div className="bg-darkGray rounded-lg p-6">
          <Skeleton className="h-6 w-24 bg-gray-700 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded bg-gray-700" />
                <Skeleton className="h-4 w-32 bg-gray-700" />
              </div>
            ))}
          </div>
        </div>

        {/* Activity/Stats */}
        <div className="bg-darkGray rounded-lg p-6">
          <Skeleton className="h-6 w-20 bg-gray-700 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-24 bg-gray-700" />
                <Skeleton className="h-6 w-12 bg-gray-700" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 