"use client";

import { ProductsTable } from "@/components/admin/products/products-table";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
        <p className="text-gray-600 mt-1">Manage products and services catalog</p>
      </div>
      
      <ProductsTable />
    </div>
  );
}