"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/convex";
import { Package, Building2, Calendar, Users, FolderOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

const formatFunding = (funding?: {
  fundingStage?: string | null;
  totalFundingRaised?: number | null;
}) => {
  if (!funding) return null;

  const { fundingStage, totalFundingRaised } = funding;

  if (fundingStage && totalFundingRaised) {
    return `${fundingStage} - $${totalFundingRaised.toLocaleString()}`;
  }

  if (fundingStage) return fundingStage;
  if (totalFundingRaised) return `$${totalFundingRaised.toLocaleString()}`;

  return null;
};

export function ProductCard({ product, className }: ProductCardProps) {
  const projectCount = Array.isArray(product.projects)
    ? product.projects.length
    : 0;
  const fundingInfo = formatFunding(product.fundingInformation);

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

            {/* Founding Date */}
            {product.foundingDate && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Calendar className="h-4 w-4" />
                <span>
                  Founded{" "}
                  {formatDistanceToNow(new Date(product.foundingDate), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            )}

            {/* CTO */}
            {product.cto && typeof product.cto === "object" && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Users className="h-4 w-4" />
                <span>CTO: {product.cto.name}</span>
              </div>
            )}

            {/* Funding Information */}
            {fundingInfo && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                <Badge
                  variant="outline"
                  className="text-xs bg-darkPrimary/10 text-darkPrimary border-darkPrimary/20"
                >
                  {fundingInfo}
                </Badge>
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
