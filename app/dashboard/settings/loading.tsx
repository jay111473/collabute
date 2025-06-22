import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 bg-gray-700" />
        <Skeleton className="h-5 w-96 bg-gray-700" />
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6">
        {/* Account Settings Card */}
        <div className="bg-darkGray rounded-lg p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-40 bg-gray-700" />
            
            {/* Form Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-gray-700" />
                <Skeleton className="h-10 w-full bg-gray-700" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-gray-700" />
                <Skeleton className="h-10 w-full bg-gray-700" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-gray-700" />
                <Skeleton className="h-10 w-full bg-gray-700" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-gray-700" />
                <Skeleton className="h-10 w-full bg-gray-700" />
              </div>
            </div>
            
            <Skeleton className="h-10 w-32 bg-gray-700" />
          </div>
        </div>

        {/* Preferences Settings Card */}
        <div className="bg-darkGray rounded-lg p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 bg-gray-700" />
            
            {/* Toggle Settings */}
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-48 bg-gray-700" />
                    <Skeleton className="h-3 w-72 bg-gray-700" />
                  </div>
                  <Skeleton className="h-6 w-12 bg-gray-700 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 bg-red-500/30" />
            <Skeleton className="h-4 w-96 bg-red-500/20" />
            <Skeleton className="h-10 w-40 bg-red-500/30" />
          </div>
        </div>
      </div>
    </div>
  );
} 