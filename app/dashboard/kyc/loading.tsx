import { Skeleton } from "@/components/ui/skeleton";

export default function KYCLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 bg-gray-700" />
        <Skeleton className="h-5 w-96 bg-gray-700" />
      </div>

      {/* Progress Indicator */}
      <div className="bg-darkGray rounded-lg p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-40 bg-gray-700" />
          <Skeleton className="h-2 w-full bg-gray-700 rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24 bg-gray-700" />
            <Skeleton className="h-4 w-16 bg-gray-700" />
          </div>
        </div>
      </div>

      {/* KYC Form Sections */}
      <div className="grid gap-6">
        {/* Personal Information */}
        <div className="bg-darkGray rounded-lg p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48 bg-gray-700" />
            
            <div className="grid gap-4 md:grid-cols-2">
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
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-gray-700" />
                <Skeleton className="h-10 w-full bg-gray-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-darkGray rounded-lg p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-52 bg-gray-700" />
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-gray-700" />
                <Skeleton className="h-10 w-full bg-gray-700" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 bg-gray-700" />
                <Skeleton className="h-10 w-full bg-gray-700" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-36 bg-gray-700" />
              <Skeleton className="h-20 w-full bg-gray-700" />
            </div>
          </div>
        </div>

        {/* Document Upload */}
        <div className="bg-darkGray rounded-lg p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-44 bg-gray-700" />
            
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32 bg-gray-700" />
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-8">
                    <div className="flex flex-col items-center space-y-2">
                      <Skeleton className="h-12 w-12 rounded bg-gray-700" />
                      <Skeleton className="h-4 w-40 bg-gray-700" />
                      <Skeleton className="h-3 w-32 bg-gray-700" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Banking Information */}
        <div className="bg-darkGray rounded-lg p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48 bg-gray-700" />
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 bg-gray-700" />
                <Skeleton className="h-10 w-full bg-gray-700" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-gray-700" />
                <Skeleton className="h-10 w-full bg-gray-700" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-gray-700" />
                <Skeleton className="h-10 w-full bg-gray-700" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-36 bg-gray-700" />
                <Skeleton className="h-10 w-full bg-gray-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Skeleton className="h-10 w-24 bg-gray-700" />
          <Skeleton className="h-10 w-32 bg-gray-700" />
        </div>
      </div>
    </div>
  );
} 