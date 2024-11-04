import { Badge } from "@/components/ui/badge";
import { GitPullRequest } from "lucide-react";
import React from "react";

type Props = {};

const items: Array<{ label: string; Icon: React.FC<any> }> = [
  {
    Icon: GitPullRequest,
    label: "Trends",
  },
  {
    Icon: GitPullRequest,
    label: "Popular",
  },
  {
    Icon: GitPullRequest,
    label: "Urgent",
  },
  {
    Icon: GitPullRequest,
    label: "Featured",
  },
  {
    Icon: GitPullRequest,
    label: "Ai",
  },
  {
    Icon: GitPullRequest,
    label: "Ai",
  },
];

export const Filters: React.FC<Props> = (props) => {
  return (
    <span className="flex gap-2">
      {items?.map((item, index) => {
        const Icon = item?.Icon;
        return (
          <Badge
            key={index}
            className="font-medium !text-xs"
            icon={<Icon className="h-4 w-4 text-primary2" />}
            variant="outline"
          >
            {item?.label}
          </Badge>
        );
      })}
    </span>
  );
};
