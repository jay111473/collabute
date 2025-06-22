import { Skeleton } from "@/components/ui/skeleton";

// Card skeleton for dashboard cards
export const DashboardCardSkeleton = () => (
  <div className="bg-darkGray rounded-lg p-4">
    <div className="flex flex-row items-start justify-between space-y-0 pb-2">
      <Skeleton className="h-5 bg-gray-700 rounded w-28" />
      <Skeleton className="h-4 w-4 bg-gray-700 rounded" />
    </div>
    <div className="flex items-center space-x-2">
      <Skeleton className="h-8 bg-gray-700 rounded w-20" />
    </div>
    <Skeleton className="h-4 bg-gray-700 rounded w-32 mt-2" />
  </div>
);

// Table row skeleton
export const TableRowSkeleton = () => (
  <div className="border-white/5 bg-darkGray rounded-lg mx-0 p-4 flex items-center justify-between m-2">
    <div className="flex justify-center items-center space-x-4">
      <Skeleton className="h-10 w-10 rounded-lg bg-gray-700" />
      <div className="flex flex-col">
        <Skeleton className="h-5 w-40 bg-gray-700 rounded mb-2" />
        <Skeleton className="h-4 w-24 bg-gray-700 rounded" />
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Skeleton className="h-6 w-6 bg-gray-700 rounded" />
      <Skeleton className="h-5 w-16 bg-gray-700 rounded" />
    </div>
  </div>
);

// Project card skeleton
export const ProjectCardSkeleton = () => (
  <div className="bg-darkGray p-6 rounded-xl">
    <div className="flex justify-between mb-4">
      <div>
        <Skeleton className="h-6 w-48 bg-gray-700 mb-2 rounded" />
        <Skeleton className="h-5 w-32 bg-gray-700 rounded" />
      </div>
      <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
    </div>
    <Skeleton className="h-20 w-full bg-gray-700 mb-4 rounded" />
    <div className="flex gap-2 mb-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-7 w-20 bg-gray-700 rounded-full" />
      ))}
    </div>
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full bg-gray-700" />
        <Skeleton className="h-5 w-32 bg-gray-700 rounded" />
      </div>
      <Skeleton className="h-9 w-24 bg-gray-700 rounded" />
    </div>
  </div>
);

// Form field skeleton
export const FormFieldSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-24 bg-gray-700" />
    <Skeleton className="h-10 w-full bg-gray-700" />
  </div>
);

// Page header skeleton
export const PageHeaderSkeleton = ({ 
  titleWidth = "w-48", 
  subtitleWidth = "w-96" 
}: { 
  titleWidth?: string; 
  subtitleWidth?: string; 
}) => (
  <div className="space-y-2">
    <Skeleton className={`h-8 ${titleWidth} bg-gray-700`} />
    <Skeleton className={`h-5 ${subtitleWidth} bg-gray-700`} />
  </div>
);

// Navigation skeleton for sidebar
export const NavigationSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-10 w-full bg-gray-700 rounded-lg" />
    {Array.from({ length: 6 }).map((_, i) => (
      <Skeleton key={i} className="h-9 w-full bg-gray-700 rounded-lg" />
    ))}
  </div>
);

// Stats grid skeleton
export const StatsGridSkeleton = ({ columns = 3 }: { columns?: number }) => (
  <div className={`grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-${columns}`}>
    {Array.from({ length: columns }).map((_, i) => (
      <DashboardCardSkeleton key={i} />
    ))}
  </div>
); 