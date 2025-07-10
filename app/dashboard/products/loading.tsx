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

// Header skeleton
const HeaderSkeleton = () => (
  <header className="flex h-14 justify-between items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
    <Skeleton className="h-6 w-32 bg-[#222] rounded-md" />
    <div className="w-10 h-10 rounded-full border flex items-center justify-center border-opacity-50">
      <CircleUser className="h-5 w-5" />
    </div>
  </header>
);

// Search and sort skeleton
const SearchSortSkeleton = () => (
  <div className="flex items-center gap-4">
    <Skeleton className="h-12 flex-1 bg-[#222] rounded-[18px]" />
    <Skeleton className="h-12 w-32 bg-[#222] rounded-full" />
  </div>
);

// Product card skeleton
const ProductCardSkeleton = () => (
  <div className="bg-darkGray border border-grayBorders rounded-lg p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 bg-[#222] rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32 bg-[#222]" />
          <Skeleton className="h-4 w-48 bg-[#222]" />
        </div>
      </div>
    </div>
    
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 bg-[#222]" />
        <Skeleton className="h-4 w-20 bg-[#222]" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 bg-[#222]" />
        <Skeleton className="h-4 w-24 bg-[#222]" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 bg-[#222]" />
        <Skeleton className="h-6 w-20 bg-[#222] rounded-full" />
      </div>
    </div>
    
    <div className="mt-4 pt-4 border-t border-gray-700">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24 bg-[#222]" />
        <Skeleton className="h-3 w-20 bg-[#222]" />
      </div>
    </div>
  </div>
);

export default function ProductsLoading() {
  return (
    <div className="flex">
      <SidebarSkeleton />
      <div className="flex flex-col w-full bg-black">
        <HeaderSkeleton />
        <main className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-32 bg-[#222] mb-2" />
              <Skeleton className="h-4 w-64 bg-[#222]" />
            </div>
          </div>
          
          {/* Search and Sort */}
          <SearchSortSkeleton />
          
          {/* Products grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
} 