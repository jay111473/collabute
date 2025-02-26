"use client";

import { Badge } from "@/components/ui/badge";
import RectangleStack from "@/public/icons/rectangle-stack";
import { Issue, User } from "@/types/dashboard";
import { Circle, CircleDot, Clock, ArrowLeft } from "lucide-react";
import { getBulbColor, getStatusInfo } from "@/lib/utils";
import { format } from "date-fns";
import { ApplyDrawer } from "@/components/dashboard/project/issue-card/apply-drawer";
import { Divider } from "@/components/uikit/divider";
import { YouTubeEmbed } from "@/components/ui/youtube-embed";
import Link from "next/link";

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const DetailRow = ({ icon, label, value }: DetailRowProps) => (
  <div className="flex justify-between items-center gap-2 py-2">
    <div className="flex items-center gap-2">
      {icon}
      <p className="text-sm text-gray-400">{label}</p>
    </div>
    <p className="text-sm text-gray-200">{value}</p>
  </div>
);

interface IssueDetailsProps {
  issue: Issue;
}

export default function IssueDetails({ issue }: IssueDetailsProps) {
  const { label, color } = getStatusInfo(issue.status);
  const pendingRequestsCount =
    issue.requests?.filter((request) => request.requestStatus === "pending")
      .length || 0;

  const handleApply = (id: string) => {
    console.log("Applied to issue:", id);
    // Add your client-side apply logic here
  };

  return (
    <div className="flex flex-col gap-4 py-4 bg-black text-white w-full">
      <div className="flex items-center gap-3 px-4">
        <Link
          href="/dashboard/issues"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back to Issues
        </Link>
      </div>

      <div className="flex items-center justify-between px-4">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <CircleDot className="text-primary2" size={18} />
          {issue.title}
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Budget</span>
            <span className="text-primary-light font-semibold">
              ${issue.budget}
            </span>
          </div>
          <ApplyDrawer
            issue={issue}
            projectTitle={issue.project?.title || ""}
            onApply={handleApply}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 px-4">
        <Badge
          icon={<Clock className="h-3 w-3 text-primary2" />}
          className="font-medium text-xs"
          variant="outline"
        >
          {format(new Date(issue.createdAt), "MMM dd, yyyy")}
        </Badge>
        <Badge
          icon={<RectangleStack className="h-3 w-3" />}
          className="font-medium text-xs"
          variant="outline"
        >
          {pendingRequestsCount} pending request
        </Badge>
        <Badge
          icon={
            <Circle className={`fill-current ${getBulbColor(color)}`} size={12} />
          }
          className="font-medium text-xs"
          variant="outline"
        >
          {label}
        </Badge>
      </div>

      <div className="flex flex-col gap-4 bg-black p-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-medium">Description</h2>
          <p className="text-sm text-gray-400 leading-relaxed">{issue.description}</p>
        </div>

        <Divider className="my-2 opacity-10" />

        <DetailRow
          icon={
            <Circle className={`fill-current ${getBulbColor(color)}`} size={12} />
          }
          label="Status"
          value={label}
        />

        <DetailRow
          icon={<RectangleStack className="h-4 w-4" />}
          label="Pending Requests"
          value={pendingRequestsCount}
        />

        {issue.assignees && (
          <>
            <Divider className="my-2 opacity-10" />
            <DetailRow
              icon={<CircleDot className="text-primary2" size={16} />}
              label="Assignee"
              value={issue.assignees
                ?.map((assignee) => (assignee as User).name)
                .join(", ")}
            />
          </>
        )}

        {issue.onboardingVideoLink && (
          <div className="mt-4">
            <h2 className="text-base font-medium mb-3">Onboarding Video</h2>
            <YouTubeEmbed url={issue.onboardingVideoLink} />
          </div>
        )}
      </div>
    </div>
  );
} 