import { Project } from "@/types/dashboard";
import axios from "axios";

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
  try {
    const response = await axios.get<Projects>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/projects?limit=${limit}&page=${page}&depth=1${whereQuery}`
    );
    return response?.data;
  } catch (error) {
    console.error("Error fetching project:", error);
    throw new Error("Failed to fetch project data");
  }
}
