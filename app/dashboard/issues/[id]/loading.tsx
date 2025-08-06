import { Skeleton } from "@/components/ui/skeleton";
import { Circle, CircleDot, Clock, ArrowLeft } from "lucide-react";
import RectangleStack from "@/public/icons/rectangle-stack";

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

// Detail row skeleton
const DetailRowSkeleton = () => (
  <div className="flex justify-between items-center gap-2 py-2">
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-4 rounded-full bg-[#222]" />
      <Skeleton className="h-4 w-20 bg-[#222] rounded-md" />
    </div>
    <Skeleton className="h-4 w-24 bg-[#222] rounded-md" />
  </div>
);

// Issue details skeleton
const IssueDetailsSkeleton = () => (
  <div className="flex flex-col gap-4 py-4 bg-black text-white w-full">
    <div className="flex items-center gap-3 px-4">
      <div className="flex items-center gap-2 text-gray-400">
        <ArrowLeft size={16} />
        <Skeleton className="h-4 w-24 bg-[#222] rounded-md" />
      </div>
    </div>

    <div className="flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <CircleDot className="text-primary2" size={18} />
        <Skeleton className="h-6 w-48 bg-[#222] rounded-md" />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Budget</span>
          <Skeleton className="h-5 w-16 bg-[#222] rounded-md" />
        </div>
        <Skeleton className="h-9 w-24 bg-[#222] rounded-md" />
      </div>
    </div>

    <div className="flex items-center gap-3 px-4">
      <Skeleton className="h-6 w-28 bg-[#222] rounded-full" />
      <Skeleton className="h-6 w-28 bg-[#222] rounded-full" />
      <Skeleton className="h-6 w-28 bg-[#222] rounded-full" />
    </div>

    <div className="flex flex-col gap-4 bg-black p-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-32 bg-[#222] rounded-md" />
        <Skeleton className="h-20 w-full bg-[#222] rounded-md" />
      </div>

      <div className="h-px w-full bg-white/10 my-2" />

      <DetailRowSkeleton />
      <DetailRowSkeleton />

      <div className="h-px w-full bg-white/10 my-2" />
      <DetailRowSkeleton />

      <div className="mt-4">
        <Skeleton className="h-5 w-40 bg-[#222] rounded-md mb-3" />
        <Skeleton className="h-64 w-full bg-[#222] rounded-md" />
      </div>
    </div>
  </div>
);

export default function IssueDetailsLoading() {
  return (
    <div className="flex">
      <SidebarSkeleton />
      <IssueDetailsSkeleton />
    </div>
  );
}
