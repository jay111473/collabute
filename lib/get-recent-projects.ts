import { Project } from "@/types/dashboard";
import qs from "qs";

export const getRecentProjects = async (userId: number): Promise<Project[]> => {
  const query = {
    where: {
      owner: userId,
    },
  };
  const projects = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL
    }/api/projects?sort=-createdAt&limit=5${qs.stringify(query)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return projects.json() as Promise<Project[]>;
};
