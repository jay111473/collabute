import { SearchInput } from "@/components/uikit/search-input";
import React from "react";
import { Filters } from "./filters";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitPullRequest } from "lucide-react";
import { Divider } from "@/components/uikit/divider";
import { Progress } from "@/components/ui/progress";
import { Users } from "@/components/uikit/uesrs";

type Props = {};

export const ExploreComponent: React.FC<Props> = (props) => {
  return (
    <span className="flex flex-col gap-3">
      <SearchInput placeholder="Search projects..." />
      <Filters />
      <span>
        <Card className="bg-gray-50 text-black">
          <CardContent className="flex flex-col space-y-2 p-0 py-6">
            <span className="flex flex-col px-6">
              <span className="flex items-center gap-2">
                <h3 className="text-xl font-bold">Ai Video creator tool </h3>
                <Badge
                  className="font-medium !text-xs"
                  icon={<GitPullRequest className="h-4 w-4 text-primary2" />}
                  variant="outline"
                >
                  24 issues
                </Badge>
                <span className="flex-1" />
                <span className="flex flex-col items-center">
                  <span className="text-primary-light font-bold text-lg">
                    $20 k
                  </span>
                  <span className="text-gray-500">Budget</span>
                </span>
              </span>
              <p className="text-gray-500">
                Creative ai tool for generating videos based on prompts
              </p>
            </span>
            <Divider />
            <span className="flex px-6 items-center">
              <span className="text-xs text-gray-500">Skills</span>
              <span className="flex-1" />
              <span>Nextjs, React, Javascript</span>
            </span>
            <Divider />
            <span className="flex px-6 items-center gap-2 items-center">
              <span className="text-xs text-gray-500">Timeline</span>
              <span className="flex-1" />
              <Progress className="w-20 ml-2 bg-gray-300" value={30} /> Two
              weeks
            </span>
            <Divider />
            <span className="flex px-6 items-center">
              <span className="text-xs text-gray-500">Collabuters</span>
              <span className="flex-1" />
              <Users
                users={[
                  { src: "", label: "Sobhan" },
                  { src: "", label: "Arman" },
                  { src: "", label: "Behrooz" },
                ]}
              />
            </span>
          </CardContent>
        </Card>
      </span>
    </span>
  );
};
