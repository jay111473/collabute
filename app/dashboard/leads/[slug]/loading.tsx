export default function LeadDetailLoading() {
  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-4 w-20 bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-4 bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Main content skeleton */}
        <div className="bg-darkGray rounded-2xl p-8">
          {/* Avatar and basic info */}
          <div className="flex items-start gap-6 mb-8">
            <div className="h-24 w-24 bg-gray-700 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-8 w-64 bg-gray-700 rounded animate-pulse mb-3" />
              <div className="h-6 w-40 bg-gray-700 rounded animate-pulse mb-4" />
              <div className="flex gap-4">
                <div className="h-4 w-32 bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-28 bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-36 bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Stats grid skeleton */}
          <div className="grid grid-cols-3 gap-8 mb-8 py-6 border-y border-gray-800">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="h-8 w-16 bg-gray-700 rounded animate-pulse mx-auto mb-2" />
                <div className="h-4 w-24 bg-gray-700 rounded animate-pulse mx-auto" />
              </div>
            ))}
          </div>

          {/* Details skeleton */}
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 w-20 bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-48 bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
