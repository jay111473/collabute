"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { Product } from "@/types/convex";

interface UseProductsOptions {
  page?: number;
  limit?: number;
  category?: string;
  isActive?: boolean;
}

export function useProductsConvex(options: UseProductsOptions = {}): {
  products: Product[];
  totalPages: number;
  currentPage: number;
  totalProducts: number;
  loading: boolean;
  error: null;
  refetch: () => void;
} {
  const { page = 1, limit = 10, category, isActive = true } = options;

  const result = useQuery(api.products.getProducts, {
    page,
    limit,
    category,
    isActive,
  });

  return {
    products: result?.products || [],
    totalPages: result?.totalPages || 0,
    currentPage: result?.currentPage || 1,
    totalProducts: result?.totalProducts || 0,
    loading: result === undefined,
    error: null,
    refetch: () => {
      // Convex automatically refetches when dependencies change
    },
  };
}

export function useProductById(productId: Id<"products">): {
  product: Product | undefined;
  loading: boolean;
  error: null;
} {
  const product = useQuery(api.products.getProductById, { productId });

  return {
    product: product || undefined,
    loading: product === undefined,
    error: null,
  };
}

export function useProductsByCategory(
  category: string,
  limit?: number
): {
  products: Product[];
  loading: boolean;
  error: null;
} {
  const products = useQuery(api.products.getProductsByCategory, {
    category,
    limit,
  });

  return {
    products: products || [],
    loading: products === undefined,
    error: null,
  };
}

export function useActiveProducts(limit?: number): {
  products: Product[];
  loading: boolean;
  error: null;
} {
  const products = useQuery(api.products.getActiveProducts, { limit });

  return {
    products: products || [],
    loading: products === undefined,
    error: null,
  };
}

// Backward compatibility
export function useProductsData(options: UseProductsOptions = {}) {
  return useProductsConvex(options);
}
