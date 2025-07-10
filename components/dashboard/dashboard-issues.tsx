"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GitCommit } from "lucide-react";
import { truncateToFourWords } from "@/lib/utils";
import { useUserData } from "@/hooks/use-user-data";
import { Issue } from "@/types/dashboard";

const IssuesTable = ({ issues }: { issues: Issue[] }) => (
  <Table>
    {issues?.length === 0 && (
      <TableBody>
        <TableRow>
          <TableCell colSpan={3} className="text-center py-4 text-md">
            You don&apos;t have any issues yet.
          </TableCell>
        </TableRow>
      </TableBody>
    )}
    <TableBody>
      {issues?.map((issue) => (
        <TableRow
          key={issue.id}
          className="border-white/5 bg-darkGray hover:bg-white/5 rounded-lg mx-0 p-0 flex items-center m-0"
        >
          <TableCell className="flex justify-center items-center space-x-4 py-2">
            <div className="bg-neutral-800 p-2 rounded-lg">
              <GitCommit className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-white" title={issue.title}>
                {truncateToFourWords(issue.title)}
              </span>
              <p className="text-xs text-white/60">
                {issue.description
                  ? issue.description.length > 40
                    ? issue.description.substring(0, 20) + "..."
                    : issue.description
                  : "No description"}
              </p>
            </div>
          </TableCell>

          <TableCell>
            <Badge
              className={`${
                issue.priority === "high"
                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                  : issue.priority === "medium"
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  : "bg-green-500/10 text-green-500 border-green-500/20"
              }`}
            >
              {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
            </Badge>
          </TableCell>
          <TableCell>
            <span className="text-sm text-white/70">
              {new Date(issue.updatedAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default function DashboardIssues() {
  const { user } = useUserData();

  if (!user) return null;

  const issues =
    user.type === "developer" ? user.developerFields?.issues || [] : [];

  return (
    <Card className="bg-darkGray border-none">
      <CardHeader>
        <CardTitle className="text-white">Recent Issues</CardTitle>
      </CardHeader>
      <CardContent className="p-0 px-2 pb-4">
        <IssuesTable issues={issues as Issue[]} />
      </CardContent>
    </Card>
  );
}
