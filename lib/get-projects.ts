import { Project } from "@/types/dashboard";
import axios from "axios";
import { cookies } from "next/headers";

export interface Projects {
  docs: Project[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export async function getProjects(
  page: number = 1,
  limit: number = 5,
  query?: {
    [key: string]: string;
  }
): Promise<Projects> {
  const whereQuery = query ? `&where=${JSON.stringify(query)}` : "";
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  console.log("token", token);
  try {
    const response = await axios.get<Projects>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/projects?limit=${limit}&page=${page}&depth=1${whereQuery}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response?.data;
  } catch (error) {
    console.error("Error fetching project:", error);
    throw new Error("Failed to fetch project data");
  }
}
