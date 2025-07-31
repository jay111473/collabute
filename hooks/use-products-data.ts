"use client";

import { useState, useEffect, useCallback } from "react";
import { stringify } from "qs-esm";
import { Product, User } from "@/types/convex";

interface UseProductsDataOptions {
  page?: number;
  limit?: number;
  type?: "startup" | "developer";
  status?: "active" | "completed" | "pending";
  where?: Record<string, any>; // PayloadCMS-style where query
  user?: User;
}

interface UseProductsDataReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalProducts: number;
  refetch: () => Promise<void>;
}

export function useProductsData(
  options: UseProductsDataOptions = {}
): UseProductsDataReturn {
  const { page = 1, limit = 10, type, status, where = {}, user } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams: Record<string, any> = {
        page,
        limit,
      };

      if (type) queryParams.type = type;
      if (status) queryParams.status = status;

      // Add where conditions
      if (Object.keys(where).length > 0) {
        Object.entries(where).forEach(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            // Handle nested where conditions like { owner: { equals: "123" } }
            Object.entries(value).forEach(([operator, operatorValue]) => {
              queryParams[`where[${key}][${operator}]`] = operatorValue;
            });
          } else {
            queryParams[`where[${key}]`] = value;
          }
        });
      }

      const queryString = stringify(queryParams, {
        addQueryPrefix: true,
        encode: true,
      });
      let response;
      try {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products${queryString}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              user: JSON.stringify(user),
            },
          }
        );
      } catch (error) {
        console.error("Error fetching products:", error);
      }

      console.log(await response?.json());
      if (!response?.ok) {
        throw new Error(`HTTP error! status: ${response?.status}`);
      }

      const data = await response?.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const result = {
        products: data.products || [],
        totalPages: data.totalPages || 0,
        currentPage: data.currentPage || 1,
        totalProducts: data.totalProducts || 0,
      };

      // Update state
      setProducts(result.products);
      setTotalPages(result.totalPages);
      setCurrentPage(result.currentPage);
      setTotalProducts(result.totalProducts);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch products";
      console.error("Error fetching products:", err);
      setError(errorMessage);
      setProducts([]);
      setTotalPages(0);
      setCurrentPage(1);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, type, status, JSON.stringify(where)]);

  // Refetch function for manual refresh
  const refetch = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    totalPages,
    currentPage,
    totalProducts,
    refetch,
  };
}
