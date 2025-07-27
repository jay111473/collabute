import { Metadata } from "next";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import DevelopersClient from "@/components/developers/DevelopersClient";

export const metadata: Metadata = {
  title: "Explore Developers | Dashboard | Collabute",
  description: "Discover and connect with top developers for your projects.",
};

type SearchParams = { [key: string]: string } | undefined;

export default async function DashboardDevelopersPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  // Extract search query from URL params
  const search = resolvedSearchParams?.search || undefined;

  // Preload developers data from Convex
  const developers = await preloadQuery(api.users.getDevelopersWithProfiles, {
    limit: 50,
    search,
  });

  return (
    <div className="flex-1 flex flex-col">
      <DevelopersClient developers={developers} />
    </div>
  );
}
