import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign } from "lucide-react"

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

// Dashboard card skeleton
const DashboardCardSkeleton = () => (
  <div className="bg-darkGray rounded-lg p-4">
    <div className="flex flex-row items-start justify-between space-y-0 pb-2">
      <Skeleton className="h-5 w-32 bg-[#222] rounded-md" />
      <DollarSign className="h-4 w-4 text-white/50" />
    </div>
    <div className="flex items-center space-x-2">
      <Skeleton className="h-8 w-28 bg-[#222] rounded-md" />
    </div>
  </div>
);

// Transaction box skeleton
const TransactionBoxSkeleton = () => (
  <div className="w-full border rounded-lg p-4">
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3">
        <Skeleton className="h-9 w-9 rounded-full bg-[#222]" />
        <div className="flex flex-col justify-start items-start space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-36 bg-[#222] rounded-md" />
            <Skeleton className="h-5 w-32 bg-[#222] rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20 bg-[#222] rounded-full" />
            <Skeleton className="h-4 w-32 bg-[#222] rounded-md" />
          </div>
        </div>
      </div>
      <Skeleton className="h-6 w-20 bg-[#222] rounded-md" />
    </div>
  </div>
);

export default function PaymentsLoading() {
  return (
    <div className="flex bg-black">
      <SidebarSkeleton />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="grid gap-4 md:grid-cols-2 md:gap-4 lg:grid-cols-2">
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-28 bg-[#222] rounded-md" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <TransactionBoxSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
} 