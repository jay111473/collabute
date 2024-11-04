import { Badge } from "@/components/ui/badge";
import RectangleStack from "@/public/icons/rectangle-stack";
import { Issue } from "@/types/dashboard";
import { Circle, DollarSign } from "lucide-react";
import { getBulbColor, getStatusInfo } from "@/lib/utils";

interface IssueCardProps {
  issue: Issue;
}

const IssueCard = ({ issue }: IssueCardProps) => {
  const { label, color } = getStatusInfo(issue.status);

  return (
    <div className="flex flex-col gap-2 py-4 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-start gap-4 px-4">
        <h3 className="font-medium text-black text-sm">{issue?.title}</h3>
        <Badge
          icon={<RectangleStack />}
          className="font-medium text-xs "
          variant="outline"
        >
          {issue.requests.filter(
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
          className="font-medium text-xs "
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
      </div>
      <p className="text-gray-600 font-medium text-xs px-4 py-2">
        {issue.description}
      </p>
    </div>
  );
};

export default IssueCard;
