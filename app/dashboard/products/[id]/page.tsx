"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Product, Project } from "@/types/convex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  ArrowLeft,
  Calendar,
  Users,
  FolderOpen,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ProjectCard } from "@/components/dashboard/projects/project-card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { StackedAvatars } from "@/components/ui/stacked-avatars";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const projects = useQuery(api.projects.getProjectsByProductId, {
    productId: params.id as Id<"products">,
  }) as Project[];
  const teamLeads = useQuery(api.products.getProductsTeamLeads, {
    productId: params.id as Id<"products">,
  });
  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id || typeof params.id !== "string") return;

      try {
        setLoading(true);
        const response = await fetch(`/api/products/${params.id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const productData = await response.json();

        if (productData.error) {
          throw new Error(productData.error);
        }

        setProduct(productData);
      } catch (err) {
        console.error("Error fetching product:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load product";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col w-full bg-black min-h-screen">
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="h-48 bg-gray-700 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col w-full bg-black min-h-screen">
        <div className="p-6 text-center">
          <p className="text-red-500 mb-4">{error || "Product not found"}</p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-black min-h-screen">
      <main className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Product Details Card */}
        <Card className="bg-darkGray border-grayBorders">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-darkPrimary/10">
                  <Package className="h-8 w-8 text-darkPrimary" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-white">
                    {product.name}
                  </CardTitle>
                  <p className="text-gray-400 mt-1">
                    {product.description || "No description available"}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Project Count */}
              <div className="flex items-center gap-3">
                <FolderOpen className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Projects</p>
                  <p className="text-lg font-semibold text-white">
                    {projects.length}
                  </p>
                </div>
              </div>

              {/* Team Leads */}
              {teamLeads && teamLeads.length > 0 && (
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Team Leads</p>
                    <div className="mt-1">
                      <StackedAvatars 
                        users={teamLeads} 
                        maxDisplay={3}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Projects</h2>
              <p className="text-gray-400 text-sm">
                {projects.length}{" "}
                {projects.length === 1 ? "project" : "projects"} in this product
              </p>
            </div>
            {projects.length > 0 && (
              <Link href="/dashboard/projects">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View All Projects
                </Button>
              </Link>
            )}
          </div>

          {projects.length === 0 ? (
            <Card className="bg-darkGray border-grayBorders">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No Projects Yet
                </h3>
                <p className="text-gray-400 text-sm text-center mb-4">
                  This product doesn&apos;t have any projects associated with it
                  yet.
                </p>
                <Link href="/dashboard/wizard">
                  <Button className="bg-darkPrimary hover:bg-darkPrimary/80">
                    Create First Project
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
