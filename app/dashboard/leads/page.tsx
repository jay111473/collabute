import { Metadata } from "next";
import ProjectManagersClient from "@/components/leads/ProjectLeadsClient";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { User } from "@/types/convex";

export const metadata: Metadata = {
  title: "Project Managers | Dashboard | Collabute",
  description:
    "Explore and connect with top project managers for your project.",
};

type SearchParams = { [key: string]: string } | undefined;

async function getProjectManagers(
  searchParams: SearchParams = {}
): Promise<User[]> {
  try {
    const preloaded = await preloadQuery(api.users.getUsersByType, {
      type: "LEAD",
      limit: 50,
    });

    const users = preloaded._valueJSON || [];

    // Apply client-side filtering for now since Convex doesn't support complex queries
    let filteredUsers: User[] = Array.isArray(users) ? users : [];

    // Apply search filter
    if (searchParams?.search) {
      const searchTerm = searchParams.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user: any) =>
          user.name?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm)
      );
    }

    return filteredUsers as User[];
  } catch (error) {
    console.error("Error fetching project managers:", error);
    return [];
  }
}

export default async function DashboardProjectManagersPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const projectManagers = await getProjectManagers(resolvedSearchParams);

  return (
    <div className="flex-1 flex flex-col">
      <ProjectManagersClient
        projectManagers={projectManagers}
      />
    </div>
  );
}
