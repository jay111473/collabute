"use client";

import { Badge } from "@/components/ui/badge";
import RectangleStack from "@/public/icons/rectangle-stack";
import { Circle, CircleDot, Clock, ArrowLeft, Users } from "lucide-react";
import { getBulbColor, getStatusInfo } from "@/lib/utils";
import { format } from "date-fns";
import { ApplyDrawer } from "@/components/dashboard/project/issue-card/apply-drawer";
import { Divider } from "@/components/uikit/divider";
import { YouTubeEmbed } from "@/components/ui/youtube-embed";
import Link from "next/link";
import { ChatButton } from "@/components/chat/chat-button";
import { CollaborationRequestDrawer } from "./collaboration-request-drawer";
import { useUserConvex } from "@/hooks/use-user-convex";
import { User as ConvexUser } from "@/types/convex";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Type guard function to safely check if a value is a Convex User object
function isConvexUser(value: unknown): value is ConvexUser {
  return (
    typeof value === "object" &&
    value !== null &&
    "_id" in value &&
    "name" in value &&
    "email" in value &&
    typeof (value as any).name === "string" &&
    typeof (value as any).email === "string"
  );
}
interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const DetailRow = ({ icon, label, value }: DetailRowProps) => (
  <div className="flex justify-between items-center gap-2 py-2">
    <div className="flex items-center gap-2">
      {icon}
      <p className="text-sm text-white">{label}</p>
    </div>
    <p className="text-sm text-gray-200">{value}</p>
  </div>
);

interface IssueDetailsProps {
  issueId: string;
}

export default function IssueDetails({ issueId }: IssueDetailsProps) {
  const { user } = useUserConvex();
  const issue = useQuery(api.issues.getIssueById, { issueId: issueId as any });
  const createCollaborationRequest = useMutation(
    api.issues.createCollaborationRequest
  );

  if (!issue) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-white">Loading issue details...</p>
      </div>
    );
  }

  const { label, color } = getStatusInfo(issue.status);
  const pendingRequestsCount =
    issue.requests?.filter(
      (request: any) => request.requestStatus === "pending"
    ).length || 0;
  const collaborationRequestsCount = issue.collaborationRequests?.length || 0;

  const handleApply = () => {
    // Refresh the issue data after application submission
    // The issue will be refetched automatically due to Convex reactivity
  };

  const handleCollaborationRequest = async (data: {
    percentageShare: number;
    taskDefinition: string;
  }) => {
    try {
      await createCollaborationRequest({
        issueId: issue._id,
        percentageShare: data.percentageShare,
        taskDefinition: data.taskDefinition,
      });
    } catch (error) {
      console.error("Collaboration request error:", error);
      throw error;
    }
  };

  const project = issue.project;
  const projectOwner = project?.lead;

  // Check if current user is a collaborator on this project
  const isCollaborator =
    user &&
    project?.collabuters?.some((collaborator: any) => {
      const collaboratorUser = collaborator.collabuter;
      return (
        isConvexUser(collaboratorUser) &&
        collaboratorUser._id === user._id &&
        collaborator.status === "active"
      );
    });

  return (
    <div className="flex flex-col gap-4 py-4 bg-black text-white w-full">
      <div className="flex items-center gap-3 px-4">
        <Link
          href="/dashboard/issues"
          className="flex items-center gap-2 text-white hover:text-white transition-colors text-sm"
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
            <span className="text-white text-sm">Budget</span>
            <span className="text-primary-light font-semibold">
              ${issue.budget}
            </span>
          </div>
          {projectOwner && (
            <ChatButton
              targetUser={projectOwner}
              conversationType="project"
              conversationName={`${project?.title} - Issue Discussion`}
              conversationDescription={`Discussion about: ${issue.title}`}
              relatedProject={0}
              variant="outline"
              size="sm"
              className="text-white border-white/20 hover:bg-white/10"
            >
              Chat with PM
            </ChatButton>
          )}
          {user?.type === "DEVELOPER" && isCollaborator && (
            <CollaborationRequestDrawer
              issue={issue}
              onRequest={handleCollaborationRequest}
            />
          )}
          <ApplyDrawer
            issue={issue}
            projectTitle={project?.title || ""}
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
          {format(new Date(issue._creationTime), "MMM dd, yyyy")}
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
            <Circle
              className={`fill-current ${getBulbColor(color)}`}
              size={12}
            />
          }
          className="font-medium text-xs"
          variant="outline"
        >
          {label}
        </Badge>
        {collaborationRequestsCount > 0 && (
          <Badge
            icon={<Users className="h-3 w-3" />}
            className="font-medium text-xs"
            variant="outline"
          >
            {collaborationRequestsCount} collaboration
            {collaborationRequestsCount === 1 ? "" : "s"}
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-4 bg-black p-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-medium">Description</h2>
          <p className="text-sm text-white leading-relaxed">
            {issue.description}
          </p>
        </div>

        <Divider className="my-2 opacity-10" />

        <DetailRow
          icon={
            <Circle
              className={`fill-current ${getBulbColor(color)}`}
              size={12}
            />
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
                ?.map((assignee: any) => assignee?.name)
                .filter(Boolean)
                .join(", ")}
            />
          </>
        )}

        {issue.collaborationRequests &&
          issue.collaborationRequests.length > 0 && (
            <>
              <Divider className="my-2 opacity-10" />
              <div className="mt-4">
                <h2 className="text-base font-medium mb-3">
                  Collaboration Requests
                </h2>
                <div className="space-y-2">
                  {issue.collaborationRequests.map((request, index) => (
                    <div
                      key={request._id || index}
                      className="bg-gray-900 p-3 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            {(request.developer as any)?.name || "Developer"}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              request.status === "pending"
                                ? "border-yellow-500 text-yellow-400"
                                : request.status === "accepted"
                                  ? "border-green-500 text-green-400"
                                  : "border-red-500 text-red-400"
                            }`}
                          >
                            {request.status}
                          </Badge>
                        </div>
                        <span className="text-primary-light font-semibold">
                          {request.percentageShare}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {request.taskDefinition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
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
