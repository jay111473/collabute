import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateToFourWords(str: string): string {
  const words = str.split(" ");
  if (words.length <= 4) return str;
  return words.slice(0, 4).join(" ") + "...";
}

export function truncateText(text: string, wordLimit: number = 10): string {
  if (!text) return "";
  const words = text.split(" ");
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(" ") + "...";
}

export const getBulbColor = (color: string) => {
  switch (color) {
    case "yellow":
      return "text-yellow-400";
    case "blue":
      return "text-blue-400";
    case "green":
      return "text-green-400";
    case "gray":
      return "text-gray-400";
    default:
      return "text-gray-400";
  }
};

type Issue = {
  status: string;
};

export function getStatusInfo(status: string): {
  label: string;
  color: string;
} {
  switch (status.toLowerCase()) {
    case "open":
      return { label: "Open", color: "yellow" };
    case "in_progress":
      return { label: "In Progress", color: "blue" };
    case "resolved":
      return { label: "Resolved", color: "green" };
    case "closed":
      return { label: "Closed", color: "gray" };
    default:
      return { label: status, color: "gray" }; // Default color if status is unknown
  }
}

export function calculateProgressPercentage(
  issues: Issue[],
  completedStatus: string = "resolved"
): number {
  const completedIssues = issues.filter(
    (issue) => issue.status === completedStatus
  ).length;
  const totalIssues = issues.length;
  return totalIssues > 0
    ? Math.round((completedIssues / totalIssues) * 100)
    : 0;
}

export function calculateDetailedProgress(issues: Issue[]) {
  const total = issues?.length;
  const done = issues?.filter((issue) => issue.status === "resolved").length;
  const inProgress = issues?.filter(
    (issue) => issue.status === "in_progress"
  ).length;
  const remaining = issues?.filter(
    (issue) => issue.status === "open" || issue.status === "closed"
  ).length;

  const donePercentage = total && total > 0 ? (done / total) * 100 : 0;
  const inProgressPercentage =
    total && total > 0 ? (inProgress / total) * 100 : 0;
  const overallPercentage = Math.round(donePercentage);

  return {
    total,
    done,
    inProgress,
    remaining,
    donePercentage,
    inProgressPercentage,
    overallPercentage,
  };
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
