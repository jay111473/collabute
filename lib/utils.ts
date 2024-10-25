import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateToFourWords(str: string): string {
  const words = str.split(" ");
  if (words.length <= 4) return str;
  return words.slice(0, 4).join(" ") + "...";
}

type Issue = {
  status: string;
};

export function calculateProgressPercentage(
  issues: Issue[],
  completedStatus: string = "resolved"
): number {
  const completedIssues = issues.filter(
    (issue) => issue.status === completedStatus
  ).length;
  const totalIssues = issues.length;
  return totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;
}
