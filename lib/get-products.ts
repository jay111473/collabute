import axios from "axios";
import { Product } from "@/types/dashboard";

interface Products {
  docs: Product[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export async function getProducts(
  page: number = 1,
  limit: number = 5,
  query?: {
    [key: string]: string;
  },
  token?: string
): Promise<Products> {
  const whereQuery = query ? `&where=${JSON.stringify(query)}` : "";

  // Prepare headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await axios.get<Products>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products?limit=${limit}&page=${page}&depth=1${whereQuery}`,
      { headers }
    );
    return response?.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products data");
  }
}
