import { Skeleton } from "@/components/ui/skeleton"
import { Search, FolderOpen } from "lucide-react"

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

// Header skeleton
const HeaderSkeleton = () => (
  <div className="flex items-center justify-between border-b border-grayBorders px-6 py-4">
    <Skeleton className="h-7 w-48 bg-[#222] rounded-md" />
    <div className="flex items-center gap-4">
      <Skeleton className="h-8 w-8 rounded-full bg-[#222]" />
      <Skeleton className="h-8 w-8 rounded-full bg-[#222]" />
      <Skeleton className="h-8 w-8 rounded-full bg-[#222]" />
    </div>
  </div>
);

// Search and filters skeleton
const SearchFilterSkeleton = () => (
  <div className="space-y-6">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-700" />
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

// Project card skeleton
const ProjectCardSkeleton = () => (
  <div className="bg-darkGray p-6 rounded-xl">
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
      <Skeleton className="h-9 w-24 bg-[#222] rounded-md" />
    </div>
  </div>
);

// Pagination skeleton
const PaginationSkeleton = () => (
  <div className="flex justify-center mt-6">
    <div className="flex gap-2">
      <Skeleton className="h-10 w-10 bg-[#222] rounded-md" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-10 bg-[#222] rounded-md" />
      ))}
      <Skeleton className="h-10 w-10 bg-[#222] rounded-md" />
    </div>
  </div>
);

export default function ExploreLoading() {
  return (
    <div className="flex bg-black">
      <SidebarSkeleton />
      <div className="flex flex-col gap-3 p-6 w-full bg-black">
        <HeaderSkeleton />
        <SearchFilterSkeleton />
        
        <div className="grid gap-4 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
        
        <PaginationSkeleton />
      </div>
    </div>
  )
} 