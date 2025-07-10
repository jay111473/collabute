import { Skeleton } from "@/components/ui/skeleton"
import { Search, Bell, ChevronLeft, ChevronRight } from "lucide-react"

// Sidebar navigation item skeleton
const SidebarNavItem = () => (
  <div className="flex items-center gap-3 px-3 py-2 my-2">
    <Skeleton className="h-4 w-4 bg-[#222] rounded-md" />
    <Skeleton className="h-4 w-24 bg-[#222] rounded-md" />
  </div>
);

// Sidebar skeleton component
const SidebarSkeleton = () => (
  <div className="hidden border-r border-white/10 bg-black text-white md:block w-1/5">
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex items-center justify-start gap-x-2 px-6 pt-4 pb-12 border-b border-white/10">
        <div className="flex flex-col items-center justify-center gap-y-2 w-full">
          <Skeleton className="h-10 w-10 rounded-full bg-[#222]" />
          <Skeleton className="h-6 w-24 bg-[#222]" />
        </div>
      </div>
      <div className="flex-1 px-4 py-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SidebarNavItem key={i} />
        ))}
      </div>
    </div>
  </div>
);

// Header skeleton component
const HeaderSkeleton = () => (
  <div className="flex items-center justify-between border-b border-grayBorders px-6 py-4">
    <Skeleton className="h-7 w-48 bg-[#222] rounded-md" />
    <div className="flex items-center gap-4">
      <div className="p-2 rounded-full bg-[#222]">
        <Search className="h-5 w-5 text-gray-700" />
      </div>
      <div className="p-2 rounded-full bg-[#222]">
        <Bell className="h-5 w-5 text-gray-700" />
      </div>
      <Skeleton className="h-8 w-8 rounded-full bg-[#222]" />
    </div>
  </div>
);

// Search bar skeleton component
const SearchBarSkeleton = () => (
  <div className="relative mb-6">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-700" />
    <Skeleton className="h-11 w-full bg-[#222] rounded-lg" />
  </div>
);

// Filters skeleton component
const FiltersSkeleton = () => (
  <div className="flex items-center justify-between mb-8">
    <div className="flex gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-32 bg-[#222] rounded-lg" />
      ))}
    </div>
    <Skeleton className="h-10 w-40 bg-[#222] rounded-lg" />
  </div>
);

// Top ranked section skeleton component
const TopRankedSkeleton = () => (
  <div className="flex items-center justify-between mb-6">
    <Skeleton className="h-7 w-32 bg-[#222] rounded-md" />
    <div className="flex gap-2">
      <div className="p-1 rounded-lg bg-[#222]">
        <ChevronLeft className="h-5 w-5 text-gray-700" />
      </div>
      <div className="p-1 rounded-lg bg-[#222]">
        <ChevronRight className="h-5 w-5 text-gray-700" />
      </div>
    </div>
  </div>
);

// Stat box skeleton component
const StatBoxSkeleton = () => (
  <div className="bg-black rounded-2xl p-4">
    <Skeleton className="h-8 w-8 bg-[#222] mb-1 rounded-md" />
    <Skeleton className="h-4 w-20 bg-[#222] rounded-md" />
  </div>
);

// Lead card skeleton component
const LeadCardSkeleton = () => (
  <div className="bg-darkGray border-none p-8 rounded-2xl">
    {/* Card Header */}
    <div className="flex items-start justify-between mb-8">
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 rounded-full bg-[#222]" />
        <div>
          <Skeleton className="h-6 w-40 bg-[#222] mb-2 rounded-md" />
          <Skeleton className="h-6 w-56 bg-[#222] rounded-full" />
        </div>
      </div>
    </div>

    {/* Location and Info */}
    <div className="flex items-center gap-4 mb-8">
      <Skeleton className="h-5 w-32 bg-[#222] rounded-md" />
      <Skeleton className="h-5 w-32 bg-[#222] rounded-md" />
      <Skeleton className="h-5 w-40 bg-[#222] rounded-md" />
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-3 gap-4 mb-8">
      {Array.from({ length: 3 }).map((_, j) => (
        <StatBoxSkeleton key={j} />
      ))}
    </div>

    {/* Skills and Industry */}
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-16 bg-[#222] rounded-md" />
        <Skeleton className="h-8 w-48 bg-[#222] rounded-full" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-16 bg-[#222] rounded-md" />
        <Skeleton className="h-8 w-64 bg-[#222] rounded-full" />
      </div>
    </div>
  </div>
);

// Main content skeleton component
const MainContentSkeleton = () => (
  <div className="flex-1 flex flex-col">
    <HeaderSkeleton />
    <div className="p-6">
      <SearchBarSkeleton />
      <FiltersSkeleton />
      <TopRankedSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <LeadCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);

export default function ProjectManagersLoading() {
  return (
    <div className="flex min-h-screen bg-black">
      <SidebarSkeleton />
      <MainContentSkeleton />
    </div>
  )
} 