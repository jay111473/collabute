import { Skeleton } from "@/components/ui/skeleton"
import { CircleUser } from "lucide-react"

// Sidebar skeleton
const SidebarSkeleton = () => (
  <div className="hidden border-r border-white/10 bg-black text-white md:block w-1/5">
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex items-center justify-start gap-x-2 px-6 pt-4 pb-12 border-b border-white/10">
        <div className="flex flex-col items-center justify-center gap-y-2 w-full">
          <Skeleton className="h-10 w-10 rounded-full bg-[#222]" />
          <Skeleton className="h-5 w-24 bg-[#222]" />
        </div>
      </div>
      <div className="flex-1 p-2 lg:px-4">
        <Skeleton className="h-10 w-full bg-[#222] rounded-lg mb-3" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full bg-[#222] rounded-lg my-2" />
        ))}
      </div>
    </div>
  </div>
);

// Tab list skeleton
const TabsSkeletonList = () => (
  <div className="grid w-[400px] grid-cols-2 mb-6">
    <Skeleton className="h-10 w-full bg-[#222] rounded-md" />
    <Skeleton className="h-10 w-full bg-[#222] rounded-md" />
  </div>
);

// Project card skeleton
const ProjectCardSkeleton = () => (
  <div className="bg-darkGray p-6 rounded-xl mb-4">
    <div className="flex justify-between mb-4">
      <div>
        <Skeleton className="h-6 w-48 bg-[#222] mb-2 rounded-md" />
        <Skeleton className="h-5 w-32 bg-[#222] rounded-md" />
      </div>
      <Skeleton className="h-10 w-10 rounded-full bg-[#222]" />
    </div>
    <Skeleton className="h-20 w-full bg-[#222] mb-4 rounded-md" />
    <div className="flex gap-2 mb-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-7 w-20 bg-[#222] rounded-full" />
      ))}
    </div>
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full bg-[#222]" />
        <Skeleton className="h-5 w-32 bg-[#222] rounded-md" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-9 bg-[#222] rounded-md" />
        <Skeleton className="h-9 w-24 bg-[#222] rounded-md" />
      </div>
    </div>
  </div>
);

// Search and filters skeleton
const SearchFilterSkeleton = () => (
  <div className="space-y-6">
    <div className="relative">
      <Skeleton className="h-11 w-full bg-[#222] rounded-lg" />
    </div>
    <div className="flex justify-between">
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 bg-[#222] rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-10 w-36 bg-[#222] rounded-lg" />
    </div>
  </div>
);

// Issue card skeleton
const IssueCardSkeleton = () => (
  <div className="bg-darkGray p-6 rounded-xl">
    <div className="flex justify-between mb-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-5 w-5 rounded-full bg-[#222]" />
        <div>
          <Skeleton className="h-6 w-48 bg-[#222] mb-2 rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-24 bg-[#222] rounded-full" />
            <Skeleton className="h-5 w-24 bg-[#222] rounded-full" />
          </div>
        </div>
      </div>
      <Skeleton className="h-9 w-24 bg-[#222] rounded-md" />
    </div>
    <Skeleton className="h-16 w-full bg-[#222] mb-3 rounded-md" />
    <div className="flex justify-between">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full bg-[#222]" />
        <Skeleton className="h-5 w-32 bg-[#222] rounded-md" />
      </div>
      <Skeleton className="h-6 w-16 bg-[#222] rounded-md" />
    </div>
  </div>
);

export default function MyProjectsLoading() {
  return (
    <div className="flex">
      <SidebarSkeleton />
      <div className="flex flex-col w-full bg-black">
        <header className="flex h-14 justify-between items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Skeleton className="h-6 w-32 bg-[#222] rounded-md" />
          <div className="w-10 h-10 rounded-full border flex items-center justify-center border-opacity-50">
            <CircleUser className="h-5 w-5" />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <TabsSkeletonList />
          {/* Projects content */}
          <div>
            {Array.from({ length: 3 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
} 