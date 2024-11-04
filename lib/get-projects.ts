import { Project } from "@/types/dashboard";
import axios from "axios";

export interface Projects {
  docs: Project[];
}

export async function getProjects(page: number): Promise<Projects> {
  try {
    const response = await axios.get<Projects>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/projects?limit=5&page=${page}&depth=1`
    );
    return response?.data;
  } catch (error) {
    console.error("Error fetching project:", error);
    throw new Error("Failed to fetch project data");
  }
}
