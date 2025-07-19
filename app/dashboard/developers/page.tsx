import { Metadata } from "next";
import { User } from "@/types/dashboard";
import DevelopersClient from "@/components/developers/DevelopersClient";
import { cookies } from "next/headers";
import qs from "qs";
import { DEVELOPER_FILTERS } from "@/types/developer-filters";
import { getUser } from "@/lib/get-user";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Explore Developers | Dashboard | Collabute",
  description: "Discover and connect with top developers for your projects.",
};

type SearchParams = { [key: string]: string } | undefined;

function buildDevelopersQuery(
  searchParams: SearchParams = {}
): Record<string, any> {
  const query: Record<string, any> = {
    type: {
      equals: "developer",
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
        "developerFields.skills.skill": {
          like: searchParams.search,
        },
      },
      {
        "developerFields.primaryRole": {
          like: searchParams.search,
        },
      },
    ];
  }

  // Process filter parameters
  DEVELOPER_FILTERS.forEach((filter) => {
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
    } else if (filter.id === "skills") {
      query[filter.apiField] = {
        contains: value,
      };
    } else if (filter.id === "role") {
      query[filter.apiField] = {
        contains: value,
      };
    } else if (filter.id === "location") {
      query[filter.apiField] = {
        like: value,
      };
    } else if (filter.id === "industry") {
      query[filter.apiField] = {
        contains: value,
      };
    } else if (filter.id === "rating") {
      // Calculate rating based on experience and projects (server-side would be better)
      // For now, we'll filter by experience as a proxy
      const minExperience = parseInt(value);
      query["developerFields.experience"] = {
        greater_than_equal: minExperience,
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
      "developerFields.experience": "desc",
    };
  }

  const [field, direction] = searchParams.sort.split("_");
  return {
    [field]: direction,
  };
}

async function getDevelopers(
  token: string,
  searchParams: SearchParams = {}
): Promise<User[]> {
  const query = buildDevelopersQuery(searchParams);
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
      throw new Error("Failed to fetch developers");
    }

    const data = await res.json();
    return data.docs || [];
  } catch (error) {
    console.error("Error fetching developers:", error);
    return [];
  }
}

export default async function DashboardDevelopersPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  // Check if user is authorized to view this page
  const currentUser = await getUser();
  if (
    !currentUser ||
    (currentUser.type !== "developer" && currentUser.type !== "lead" && currentUser.type !== "projectManager")
  ) {
    redirect("/dashboard");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const developers = await getDevelopers(token || "", resolvedSearchParams);

  return (
    <div className="flex-1 flex flex-col">
      <DevelopersClient developers={developers} />
    </div>
  );
}
