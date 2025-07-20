"use client";

import ProductsComponent from "@/components/dashboard/products";
import { useProductsConvex } from "@/hooks/use-products-convex";
import { useUserConvex } from "@/hooks/use-user-convex";

export default function ProductsClientWrapper() {
  const { user, loading: userLoading } = useUserConvex();

  const { products } = useProductsConvex({
    isActive: true,
  });

  if (userLoading || !user) {
    return null; // Loading will be handled by loading.tsx
  }

  return <ProductsComponent products={products} />;
}
