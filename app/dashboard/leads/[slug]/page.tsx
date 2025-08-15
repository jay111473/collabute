import { Metadata } from "next";
import { notFound } from "next/navigation";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { User } from "@/types/convex";
import LeadDetailClient from "@/components/leads/LeadDetailClient";

interface LeadDetailPageProps {
  params: Promise<{ slug: string }>;
}

async function getLeadBySlug(slug: string): Promise<User | null> {
  try {
    const preloaded = await preloadQuery(api.users.getUserBySlug, { slug });
    return JSON.parse(preloaded._valueJSON) as User | null;
  } catch (error) {
    console.error("Error fetching lead by slug:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: LeadDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lead = await getLeadBySlug(slug);

  if (!lead) {
    return {
      title: "Lead Not Found | Collabute",
      description: "The requested lead profile could not be found.",
    };
  }

  return {
    title: `${lead.name || "Lead"} | Project Manager | Collabute`,
    description: `View profile and connect with ${lead.name || "this project manager"} for your next project.`,
  };
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { slug } = await params;
  const lead = await getLeadBySlug(slug);

  if (!lead) {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col">
      <LeadDetailClient lead={lead} />
    </div>
  );
}
