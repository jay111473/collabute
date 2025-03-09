import { Metadata } from "next";
import { User } from "@/types/dashboard";
import Sidebar from "@/components/dashboard/Sidebar";
import { cookies } from "next/headers";
import { getUser } from "@/lib/get-user";
import ProjectLeadsClient from "@/components/leads/ProjectLeadsClient";
import qs from "qs";
import { FILTERS } from "@/types/filters";

export const metadata: Metadata = {
  title: "Project Leads | Dashboard | Contribunation",
  description: "Explore and connect with top technical leads for your project.",
};

// Make this function dynamic to handle search params
async function getLeads(token: string, searchParams: { [key: string]: string }): Promise<User[]> {
  // Base query - always filter by type=lead
  const query: Record<string, any> = {
    type: {
      equals: "lead",
    },
  };
  
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
  FILTERS.forEach(filter => {
    const value = searchParams[filter.id];
    if (!value || !filter.apiField) return;

    if (filter.id === 'experience') {
      // For experience, use greater than or equal on leadFields.experience
      query[filter.apiField] = {
        greater_than_equal: parseInt(value),
      };
    } else if (filter.id === 'availability') {
      // For availability, convert string to boolean on leadFields.availability
      query[filter.apiField] = {
        equals: value === 'true',
      };
    } else if (filter.id === 'stack') {
      // For stack, search in array of stack objects by name
      query[filter.apiField] = {
        contains: value,
      };
    } else if (filter.id === 'role') {
      // For role, exact match on primaryRole
      query[filter.apiField] = {
        equals: value,
      };
    }
  });

  // Process sort parameter
  let sortOptions = {};
  if (searchParams.sort) {
    const [field, direction] = searchParams.sort.split('_');
    sortOptions = {
      [field]: direction,
    };
  } else {
    // Default sort by experience (most experienced first)
    sortOptions = {
      'leadFields.experience': 'desc',
    };
  }

  // Build query string
  const stringifiedQuery = qs.stringify(
    {
      where: query,
      sort: sortOptions,
      depth: 2, // Include nested objects like stack, skills, etc.
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
      throw new Error("Failed to fetch leads");
    }

    const data = await res.json();
    return data.docs || [];
  } catch (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
}

// Make the page component accept search params
export default async function DashboardLeadsPage({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  const { search } = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const userId = cookieStore.get("userid")?.value;
  const user = await getUser(userId || "", token || "");
  
  // Pass search params to getLeads
  const leads = await getLeads(token || "", search);

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col">
        <ProjectLeadsClient leads={leads} />
      </div>
    </div>
  );
}
