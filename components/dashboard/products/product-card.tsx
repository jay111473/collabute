"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ProductWithProjects } from "@/types/convex";
import { Package, Users, FolderOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: ProductWithProjects;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const projectCount = Array.isArray(product.projects)
    ? product.projects.length
    : 0;

  // Get unique team leads (CTOs) from all projects
  const teamLeads = Array.isArray(product.projects)
    ? product.projects
        .filter((project) => project.teamLead)
        .map((project) => project.teamLead!)
        .filter(
          (lead, index, array) =>
            array.findIndex((l) => l._id === lead._id) === index
        )
    : [];

  return (
    <Link href={`/dashboard/products/${product._id}`}>
      <Card
        className={cn(
          "group relative overflow-hidden bg-darkGray border-grayBorders hover:border-darkPrimary/50 transition-all duration-200 cursor-pointer",
          className
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-darkPrimary/10">
                <Package className="h-5 w-5 text-darkPrimary" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg group-hover:text-darkPrimary transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {product.description || "No description available"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* Project Count */}
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <FolderOpen className="h-4 w-4" />
              <span>
                {projectCount} {projectCount === 1 ? "Project" : "Projects"}
              </span>
            </div>

            {/* Team Leads (CTOs) */}
            {teamLeads.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Users className="h-4 w-4" />
                <span>
                  {teamLeads.length === 1
                    ? `CTO: ${teamLeads[0].name}`
                    : `CTOs: ${teamLeads.map((lead) => lead.name).join(", ")}`}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>
                Created{" "}
                {formatDistanceToNow(new Date(product._creationTime), {
                  addSuffix: true,
                })}
              </span>
              <span className="text-darkPrimary font-medium">
                View Details →
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
