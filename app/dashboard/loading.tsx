import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, ArrowLeftRight, GitPullRequest } from "lucide-react"

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

// Dashboard card skeleton
const DashboardCardSkeleton = ({ icon: Icon }: { icon: any }) => (
  <div className="bg-darkGray rounded-lg p-4">
    <div className="flex flex-row items-start justify-between space-y-0 pb-2">
      <Skeleton className="h-5 w-28 bg-[#222] rounded-md" />
      <Icon className="h-4 w-4 text-white/50" />
    </div>
    <div className="flex items-center space-x-2">
      <Skeleton className="h-8 w-20 bg-[#222] rounded-md" />
    </div>
    <Skeleton className="h-4 w-32 bg-[#222] rounded-md mt-2" />
  </div>
);

// Table row skeleton
const TableRowSkeleton = () => (
  <div className="border-white/5 bg-darkGray rounded-lg mx-0 p-4 flex items-center justify-between m-2">
    <div className="flex justify-center items-center space-x-4">
      <Skeleton className="h-10 w-10 rounded-lg bg-[#222]" />
      <div className="flex flex-col">
        <Skeleton className="h-5 w-40 bg-[#222] rounded-md mb-2" />
        <Skeleton className="h-4 w-24 bg-[#222] rounded-md" />
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Skeleton className="h-6 w-6 bg-[#222] rounded-md" />
      <Skeleton className="h-5 w-16 bg-[#222] rounded-md" />
    </div>
  </div>
);

// Card skeleton
const CardSkeleton = ({ title }: { title: string }) => (
  <div className="bg-darkGray rounded-lg border-none">
    <div className="p-6">
      <h3 className="text-white text-lg font-medium">{title}</h3>
    </div>
    <div className="p-0 px-2 pb-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
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

export default function DashboardLoading() {
  return (
    <div className="flex">
      <SidebarSkeleton />
      <div className="flex flex-col bg-black w-full">
        <HeaderSkeleton />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {/* Dashboard cards - showing both developer and startup layouts */}
          <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            <DashboardCardSkeleton icon={GitPullRequest} />
            <DashboardCardSkeleton icon={DollarSign} />
            <DashboardCardSkeleton icon={ArrowLeftRight} />
          </div>
          
          {/* Cards/Tables section */}
          <div className="grid gap-6 md:grid-cols-2">
            <CardSkeleton title="Recent Projects" />
            <CardSkeleton title="Recent Issues" />
          </div>
          
          {/* Projects section (startup view) */}
          <div className="flex flex-col gap-4 mt-4">
            <Skeleton className="h-7 w-36 bg-[#222] rounded-md" />
            <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-2">
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 