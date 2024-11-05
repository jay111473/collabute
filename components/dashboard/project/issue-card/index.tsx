import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import RectangleStack from "@/public/icons/rectangle-stack";
import { Issue } from "@/types/dashboard";
import { Circle, CircleDot, DollarSign } from "lucide-react";
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

interface IssueCardProps {
  issue: Issue;
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
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="flex items-center gap-4"
  >
    <Badge
      icon={<RectangleStack />}
      className="font-medium text-xs"
      variant="outline"
    >
      {issue.requests.filter((request) => request.requestStatus === "pending")
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
    <Badge
      icon={<DollarSign className="text-primary2" size={14} />}
      className="font-medium text-xs"
      variant="outline"
    >
      budget
      <span className="text-xs">${issue.budget}</span>
    </Badge>
  </motion.div>
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

const IssueCard = ({ issue }: IssueCardProps) => {
  const { label, color } = getStatusInfo(issue.status);
  const [isOpen, setIsOpen] = useState(false);

  const pendingRequestsCount =
    issue.requests.filter((request) => request.requestStatus === "pending")
      .length || 0;

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent accordion from toggling when clicking the button
    // Add your apply logic here
    console.log("Applied to issue:", issue.id);
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      onValueChange={(value) => setIsOpen(!!value)}
    >
      <AccordionItem value="item-1" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4 flex-1">
              <h3 className="font-medium text-black flex items-center gap-2">
                <CircleDot className="text-primary2" size={16} />
                {issue?.title}
              </h3>
              <AnimatePresence>
                {!isOpen && (
                  <IssueCardBadges issue={issue} color={color} label={label} />
                )}
              </AnimatePresence>
            </div>
            <Button
              onClick={handleApply}
              variant="outline"
              size="sm"
              className=" text-primary hover:text-white hover:border-primary hover:bg-primary lg:mr-4 py-2"
            >
              Apply
            </Button>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4 py-4 overflow-hidden"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col gap-2"
                >
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-sm">{issue.description}</p>
                </motion.div>

                <IssueDetailRow
                  icon={
                    <Circle
                      className={`fill-current ${getBulbColor(color)}`}
                      size={12}
                    />
                  }
                  label="Status"
                  value={label}
                  delay={0.2}
                />
                <Divider />
                <IssueDetailRow
                  icon={<DollarSign className="text-primary2" size={14} />}
                  label="Budget"
                  value={`$${issue.budget}`}
                  delay={0.3}
                />
                <Divider />
                <IssueDetailRow
                  icon={<RectangleStack />}
                  label="Pending Requests"
                  value={pendingRequestsCount}
                  delay={0.4}
                />
                {issue.onboardingVideoLink && (
                  <div className="mt-4">
                    <YouTubeEmbed url={issue.onboardingVideoLink} />
                  </div>
                )}
                {issue.assignee && (
                  <>
                    <Divider />
                    <IssueDetailRow
                      icon={<CircleDot className="text-primary2" size={16} />}
                      label="Assignee"
                      value={issue.assignee.name}
                      delay={0.5}
                    />
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default IssueCard;
