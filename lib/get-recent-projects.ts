import { Project } from "@/types/dashboard";

export const getRecentProjects = async (userId: number): Promise<Project[]> => {
  const query = {
    where: {
      user: userId,
    },
  };
  const projects = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/projects?sort=-createdAt&limit=5`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return projects.json() as Promise<Project[]>;
};
