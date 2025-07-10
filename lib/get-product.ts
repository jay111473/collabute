import axios from "axios";
import { Product } from "@/types/dashboard";
import qs from "qs";

interface Products {
  docs: Product[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export async function getProduct(id: string, token?: string): Promise<Product> {
  const query = {
    id: {
      equals: id,
    },
  };
  const stringifiedQuery = qs.stringify(
    {
      where: query, // ensure that `qs` adds the `where` property, too!
    },
    { addQueryPrefix: true }
  );

  // Prepare headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await axios.get<Products>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products${stringifiedQuery}&depth=2`,
      { headers }
    );
    return response?.data.docs[0];
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error("Failed to fetch product data");
  }
} 