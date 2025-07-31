"use client";

import ProductsComponent from "@/components/dashboard/products";
import { useProductsWithProjects } from "@/hooks/use-products-convex";
import { useUserConvex } from "@/hooks/use-user-convex";

export default function ProductsClientWrapper() {
  const { user, loading: userLoading } = useUserConvex();

  const { products, loading: productsLoading } = useProductsWithProjects({
    userId: user?._id,
    isActive: true,
  });

  if (userLoading || productsLoading || !user) {
    return null; // Loading will be handled by loading.tsx
  }

  return <ProductsComponent products={products} />;
}
