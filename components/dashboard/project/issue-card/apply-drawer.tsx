"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  ChevronLeft,
  CircleDot,
  Clock,
  DollarSign,
  Layers,
  X,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import RectangleStack from "@/public/icons/rectangle-stack";
import { getBulbColor, getStatusInfo } from "@/lib/utils";
import { Circle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { FileUpload } from "@/components/ui/file-upload";
import { Issue } from "@/types/convex";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUserConvex } from "@/hooks/use-user-convex";
import { Id } from "@/convex/_generated/dataModel";

interface ApplyDrawerProps {
  issue: Issue & { requests?: any[] }; // Extended to include requests for compatibility
  projectTitle: string;
  onApply: () => void;
}

export function ApplyDrawer({
  issue,
  projectTitle,
  onApply,
}: ApplyDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [proposal, setProposal] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadedMediaIds, setUploadedMediaIds] = useState<Id<"media">[]>([]);
  const { label, color } = getStatusInfo(issue.status);
  const { user } = useUserConvex();
  const createApplication = useMutation(api.issues.createIssueApplication);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const generateUploadUrl = useMutation(api.media.generateUploadUrl);
  const createMediaFromUpload = useMutation(api.media.createMediaFromUpload);

  
  const uploadFiles = async (): Promise<Id<"media">[]> => {
    if (!user || attachments.length === 0) return [];

    const mediaIds: Id<"media">[] = [];

    for (const file of attachments) {
      try {
        // Generate upload URL
        const postUrl = await generateUploadUrl();
        
        // Upload file to storage
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const { storageId } = await result.json();

        // Create media record
        const { mediaId } = await createMediaFromUpload({
          storageId,
          fileName: file.name,
          fileType: file.type,
          userId: user._id,
          fileSize: file.size,
          description: `Attachment for issue application: ${file.name}`,
        });

        mediaIds.push(mediaId);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        throw error;
      }
    }

    return mediaIds;
  };

  const handleApply = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user || !proposal.trim()) return;

    setIsSubmitting(true);
    try {
      // Upload files first and get media IDs
      const mediaIds = await uploadFiles();
      setUploadedMediaIds(mediaIds);

      // Create application with media IDs
      await createApplication({
        issueId: issue._id,
        proposal: proposal.trim(),
        attachments: mediaIds.length > 0 ? mediaIds : undefined,
      });

      onApply(); // Call parent callback for any additional handling
      setIsOpen(false);
      setProposal(""); // Reset form
      setAttachments([]);
      setUploadedMediaIds([]);
    } catch (error) {
      console.error("Failed to submit application:", error);
      // TODO: Show error toast to user
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="primary" size="sm" className="py-2 px-5 text-black">
          Apply
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full px-4 flex flex-col gap-4 pb-8">
          <div className="flex justify-between items-center">
            <div className="flex justify-start items-center gap-1">
              <button className="p-2 hover:bg-white">
                <ChevronLeft size={20} color="black" />
              </button>
              <h3 className="text-lg font-medium">Apply</h3>
            </div>
            <DrawerClose asChild>
              <button className="p-2 hover:bg-white ">
                <X size={20} color="black" />
              </button>
            </DrawerClose>
          </div>

          {/* Issue Details Card */}
          <div className="border rounded-lg p-4 flex flex-col gap-4">
            <div className="flex justify-start items-center gap-4 text-sm">
              <Layers size={20} className="text-darkPrimary" />
              <p className="font-medium">Project:</p>
              <p className="underline">{projectTitle}</p>
            </div>
            <div className="flex justify-start items-center gap-3 text-sm">
              <CircleDot size={24} className="text-darkPrimary" />
              <p className="text-lg font-medium">{issue.title}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                icon={<Clock className="h-4 w-4 text-darkPrimary" />}
                className="font-medium text-xs"
                variant="outline"
              >
                {format(new Date(issue._creationTime), "MMM dd, yyyy")}
              </Badge>
              <Badge
                icon={<DollarSign className="text-darkPrimary" size={14} />}
                className="font-medium text-xs"
                variant="outline"
              >
                Budget
                <span className="text-xs">${issue.budget}</span>
              </Badge>
              <Badge
                icon={<RectangleStack />}
                className="font-medium text-xs"
                variant="outline"
              >
                {issue.requests?.filter(
                  (request: any) => request.requestStatus === "pending"
                ).length || 0}{" "}
                pending request
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
            </div>

            <p className="text-sm text-white">{issue.description}</p>
          </div>

          {/* Application Section */}
          <div className="border rounded-lg p-4 flex flex-col gap-4">
            <h4 className="text-base font-medium">Your Application</h4>
            <div className="space-y-2">
              <Label htmlFor="proposal">
                Write your proposal
                <span className="text-xs text-white ml-1">
                  (Explain how you plan to solve this issue)
                </span>
              </Label>
              <TiptapEditor
                content={proposal}
                onChange={setProposal}
                placeholder="Write your proposal here..."
              />
            </div>
            <div className="space-y-2">
              <Label>
                Attachments
                <span className="text-xs text-white ml-1">
                  (Optional: Add relevant files or documents)
                </span>
              </Label>
              <FileUpload
                onFilesSelected={setAttachments}
                maxFiles={5}
                maxSize={10}
                acceptedTypes={[".pdf", ".doc", ".docx", ".txt", ".zip"]}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
            <Button
              onClick={handleApply}
              disabled={!proposal.trim() || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
