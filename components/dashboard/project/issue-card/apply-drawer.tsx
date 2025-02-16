"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Issue } from "@/types/dashboard";
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

interface ApplyDrawerProps {
  issue: Issue;
  projectTitle: string;
  onApply: (issueId: string) => void;
}

export function ApplyDrawer({
  issue,
  projectTitle,
  onApply,
}: ApplyDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [proposal, setProposal] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const { label, color } = getStatusInfo(issue.status);

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApply(issue.id.toString());
    setIsOpen(false);
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="sm"
          className="text-primary border-primary hover:text-white hover:border-primary hover:bg-primary py-2"
        >
          Apply
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full px-4 flex flex-col gap-4 pb-8">
          <div className="flex justify-between items-center">
            <div className="flex justify-start items-center gap-1">
              <button className="p-2 hover:bg-gray-100">
                <ChevronLeft size={20} color="black" />
              </button>
              <h3 className="text-lg font-medium">Apply</h3>
            </div>
            <DrawerClose asChild>
              <button className="p-2 hover:bg-gray-100 ">
                <X size={20} color="black" />
              </button>
            </DrawerClose>
          </div>
          
          {/* Issue Details Card */}
          <div className="border rounded-lg p-4 flex flex-col gap-4">
            <div className="flex justify-start items-center gap-4 text-sm">
              <Layers size={20} className="text-primary" />
              <p className="font-medium">Project:</p>
              <p className="underline">{projectTitle}</p>
            </div>
            <div className="flex justify-start items-center gap-3 text-sm">
              <CircleDot size={24} className="text-primary" />
              <p className="text-lg font-medium">{issue.title}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                icon={<Clock className="h-4 w-4 text-primary2" />}
                className="font-medium text-xs"
                variant="outline"
              >
                {format(new Date(issue.createdAt), "MMM dd, yyyy")}
              </Badge>
              <Badge
                icon={<DollarSign className="text-primary2" size={14} />}
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
                  (request) => request.requestStatus === "pending"
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

            <p className="text-sm text-gray-700">{issue.description}</p>
          </div>

          {/* Application Section */}
          <div className="border rounded-lg p-4 flex flex-col gap-4">
            <h4 className="text-base font-medium">Your Application</h4>
            <div className="space-y-2">
              <Label htmlFor="proposal">
                Write your proposal
                <span className="text-xs text-gray-500 ml-1">
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
                <span className="text-xs text-gray-500 ml-1">
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
              disabled={!proposal.trim()}
            >
              Submit Application
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
