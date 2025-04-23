import { Project } from "@/types/dashboard";
import axios from "axios";
import qs from "qs";

export interface Projects {
  docs: Project[];
}

export async function getProject(slug: string): Promise<Projects> {
  const query = {
    slug: {
      equals: slug,
    },
  };
  const stringifiedQuery = qs.stringify(
    {
      where: query, // ensure that `qs` adds the `where` property, too!
    },
    { addQueryPrefix: true }
  );

  try {
    const response = await axios.get<Projects>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/projects${stringifiedQuery}`
    );
    return response?.data;
  } catch (error) {
    throw new Error("Failed to fetch project data");
  }
}
