import { Badge } from "@/components/ui/badge";
import RectangleStack from "@/public/icons/rectangle-stack";
import { Issue } from "@/types/dashboard";
import { AlarmClock } from "lucide-react";
import React from "react";

const IssueCard = ({ issue }: { issue: Issue }) => {
  return (
    <div className="flex flex-col gap-2 py-4 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-start gap-4 px-4">
        <h3 className="font-medium text-black">{issue?.title}</h3>
        <Badge
          icon={<RectangleStack />}
          className="font-medium text-sm"
          variant="outline"
        >
          {issue.requests.filter((request) => request.requestStatus === "pending").length || 0} pending request
        </Badge>
        <Badge
          icon={<AlarmClock size={16} />}
          className="font-medium text-sm"
          variant="outline"
        >
          {issue.status}
        </Badge>
      </div>
    </div>
  );
};

export default IssueCard;
