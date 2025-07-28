"use client";

import { useState, useMemo } from "react";
import { Product } from "@/types/convex";
import { ProductCard } from "./product-card";
import { Input } from "@/components/ui/input";
import { Search, Package, FolderOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductsComponentProps {
  products: Product[];
}

const ProductsComponent = ({ products }: ProductsComponentProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const sortOptions = [
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "Name A-Z", value: "name-asc" },
    { label: "Name Z-A", value: "name-desc" },
    { label: "Most Projects", value: "projects-desc" },
  ];

  const filteredAndSortedProducts = useMemo(() => {
    let filtered =
      products?.filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());
        return matchesSearch;
      }) || [];

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime()
          );
        case "oldest":
          return (
            new Date(a._creationTime).getTime() - new Date(b._creationTime).getTime()
          );
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "projects-desc":
          const aProjects = Array.isArray(a.projects) ? a.projects.length : 0;
          const bProjects = Array.isArray(b.projects) ? b.projects.length : 0;
          return bProjects - aProjects;
        default:
          return 0;
      }
    });
  }, [products, searchQuery, sortBy]);

  const hasProducts = products?.length > 0;

  // If user has no products, show empty state
  if (!hasProducts) {
    return (
      <div className="flex flex-col w-full bg-black">
        <main className="flex flex-1 flex-col items-center justify-center py-20">
          <div className="text-center space-y-6 max-w-md">
            <div className="p-4 rounded-full bg-darkGray/50 w-fit mx-auto">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                No Products Yet
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                You haven&apos;t created any products yet. Products help you
                organize and manage multiple related projects under one
                umbrella.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-black">
      <main className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Products</h1>
            <p className="text-gray-400 text-sm">
              Manage your products and their associated projects
            </p>
          </div>
        </div>

        {/* Search and Sort Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 flex items-center gap-x-2 px-4 bg-darkGray rounded-[18px] py-3">
            <div className="flex items-center pointer-events-none z-10">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <Input
              className="p-0 text-white placeholder:text-gray-400 placeholder:bg-darkGray border-none outline-none placeholder:border-none focus:border-none focus:bg-darkGray focus:outline-none focus:ring-0 w-full"
              placeholder="Search Products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="rounded-full font-medium text-sm cursor-pointer !py-4 px-3 flex items-center gap-x-[6px] w-max bg-darkGray border-grayBorders text-white">
              <div className="flex items-center gap-2 h-full">
                <span className="text-sm text-white">Sort:</span>
                <SelectValue
                  className="text-sm text-white"
                  placeholder="Sort by"
                />
              </div>
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products List */}
        {filteredAndSortedProducts?.length === 0 && searchQuery ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <FolderOpen className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">No matching products found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedProducts?.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductsComponent;
