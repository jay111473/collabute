import { Badge } from "@/components/ui/badge";
import RectangleStack from "@/public/icons/rectangle-stack";
import { Issue, User } from "@/types/dashboard";
import { Circle, CircleDot, Clock } from "lucide-react";
import { getBulbColor, getStatusInfo } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import { Divider } from "@/components/uikit/divider";
import { motion, AnimatePresence } from "framer-motion";
import { YouTubeEmbed } from "@/components/ui/youtube-embed";
import { format } from "date-fns";
import { ApplyDrawer } from "./apply-drawer";
import Link from "next/link";

interface IssueCardProps {
  issue: Issue;
  projectTitle?: string;
  isMyProject?: boolean;
}

const IssueCardBadges = ({
  issue,
  color,
  label,
}: {
  issue: Issue;
  color: string;
  label: string;
}) => (
  <div className="flex items-center gap-4">
    <Badge
      icon={<Clock className="h-4 w-4 text-primary2" />}
      className="font-medium text-xs"
      variant="outline"
    >
      {format(new Date(issue.createdAt), "MMM dd, yyyy")}
    </Badge>
    <Badge
      icon={<RectangleStack />}
      className="font-medium text-xs"
      variant="outline"
    >
      {issue.requests?.filter((request) => request.requestStatus === "pending")
        .length || 0}{" "}
      pending request
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
);

const IssueDetailRow = ({
  icon,
  label,
  value,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="flex justify-between items-center gap-2"
  >
    <div className="flex items-center gap-2">
      {icon}
      <p className="text-sm text-gray-500">{label}</p>
    </div>
    <p className="text-sm font-semibold">{value}</p>
  </motion.div>
);

const IssueCard = ({ issue, projectTitle, isMyProject }: IssueCardProps) => {
  const { label, color } = getStatusInfo(issue.status);
  const [isOpen, setIsOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(issue.isBookmarked || false);

  const pendingRequestsCount =
    issue.requests?.filter((request) => request.requestStatus === "pending")
      .length || 0;

  const handleApply = (issueId: string) => {
    console.log("Applied to issue:", issueId);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    console.log("Bookmarked issue:", issue.id);
  };

  // Truncate description to first 100 words
  const truncatedDescription = issue.description
    ? issue.description
        .split(" ")
        .slice(0, 100)
        .join(" ")
        .concat(issue.description.split(" ").length > 100 ? "..." : "")
    : "";

  return (
    <Link href={`/dashboard/issues/${issue.id}`}>
      <div
        className={`rounded-lg px-4 bg-lightGray shadow-none hover:bg-gray-800/50 transition-colors ${
          isMyProject ? "border-l-4 border-l-primary2" : ""
        }`}
      >
        <div className="flex flex-col p-4 gap-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col gap-2 flex-1">
              <h3 className="font-medium text-white flex items-center gap-2">
                <CircleDot className="text-primary2" size={16} />
                {issue?.title}
              </h3>
              <p className="text-sm text-gray-400">{truncatedDescription}</p>
            </div>
            {!isMyProject && (
              <div className="flex items-center gap-4 ml-4">
                <div className="flex flex-col items-end">
                  <div className="text-primary-light font-bold text-xl">
                    ${issue.budget}
                  </div>
                  <p className="text-gray-500 text-xs">Budget</p>
                </div>
                <ApplyDrawer
                  issue={issue}
                  projectTitle={projectTitle || ""}
                  onApply={handleApply}
                />
              </div>
            )}
          </div>
          <IssueCardBadges issue={issue} color={color} label={label} />
        </div>
      </div>
    </Link>
  );
};

export default IssueCard;
