"use client";

import { useMemo } from "react";
import ProductsComponent from "@/components/dashboard/products";
import { useProductsData } from "@/hooks/use-products-data";
import { useUserData } from "@/hooks/use-user-data";
import { User } from "@/types/dashboard";

export default function ProductsClientWrapper() {
  const { user, loading: userLoading } = useUserData();

  // Memoize the where condition to prevent infinite loops
  const whereCondition = useMemo(() => {
    return user?.id ? { owner: { equals: user.id } } : {};
  }, [user?.id]);

  const { products } = useProductsData({
    where: whereCondition,
    user: user as User,
  });

  if (userLoading || !user) {
    return null; // Loading will be handled by loading.tsx
  }

  return <ProductsComponent products={products} />;
}
