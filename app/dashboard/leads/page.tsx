import { Metadata } from "next";
import { User } from "@/types/dashboard";
import ProjectManagersClient from "@/components/leads/ProjectLeadsClient";
import { cookies } from "next/headers";
import { getUser } from "@/lib/get-user";
import qs from "qs";
import { FILTERS } from "@/types/filters";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

export const metadata: Metadata = {
  title: "Project Managers | Dashboard | Collabute",
  description: "Explore and connect with top project managers for your project.",
};

type SearchParams = { [key: string]: string } | undefined;

function buildProjectManagersQuery(searchParams: SearchParams = {}): Record<string, any> {
  const query: Record<string, any> = {
    type: {
      equals: "lead",
    },
  };

  if (!searchParams) return query;

  // Process search parameter
  if (searchParams.search) {
    query.or = [
      {
        name: {
          like: searchParams.search,
        },
      },
      {
        "leadFields.stack.name": {
          like: searchParams.search,
        },
      },
      {
        "developerFields.skills.skill": {
          like: searchParams.search,
        },
      },
    ];
  }

  // Process filter parameters
  FILTERS.forEach((filter) => {
    const value = searchParams[filter.id];
    if (!value || !filter.apiField) return;

    if (filter.id === "experience") {
      query[filter.apiField] = {
        greater_than_equal: parseInt(value),
      };
    } else if (filter.id === "availability") {
      query[filter.apiField] = {
        equals: value === "true",
      };
    } else if (filter.id === "stack") {
      query[filter.apiField] = {
        contains: value,
      };
    } else if (filter.id === "role") {
      query[filter.apiField] = {
        equals: value,
      };
    }
  });

  return query;
}

function buildSortOptions(
  searchParams: SearchParams = {}
): Record<string, string> {
  if (!searchParams?.sort) {
    return {
      "leadFields.experience": "desc",
    };
  }

  const [field, direction] = searchParams.sort.split("_");
  return {
    [field]: direction,
  };
}

async function getProjectManagers(
  token: string,
  searchParams: SearchParams = {}
): Promise<User[]> {
  const query = buildProjectManagersQuery(searchParams);
  const sortOptions = buildSortOptions(searchParams);

  const stringifiedQuery = qs.stringify(
    {
      where: query,
      sort: sortOptions,
      depth: 2,
    },
    { addQueryPrefix: true }
  );

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users${stringifiedQuery}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch project managers");
    }

    const data = await res.json();
    return data.docs || [];
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
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = await getUser();

  const projectManagers = await getProjectManagers(token || "", resolvedSearchParams);

  return (
    <DashboardLayout user={user} title="Project Managers">
      <div className="flex-1 flex flex-col">
        <ProjectManagersClient projectManagers={projectManagers} />
      </div>
    </DashboardLayout>
  );
}
