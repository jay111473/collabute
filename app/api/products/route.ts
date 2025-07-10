import { getProducts } from "@/lib/get-products";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    // Get authentication from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    
    // Handle where parameter - qs-esm creates nested query params
    let whereQuery: Record<string, any> = {};
    
    // Extract where parameters from searchParams
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('where[')) {
        // Parse nested where parameters like where[owner][equals]
        const matches = key.match(/where\[([^\]]+)\](?:\[([^\]]+)\])?/);
        if (matches) {
          const [, field, operator] = matches;
          if (operator) {
            if (!whereQuery[field]) whereQuery[field] = {};
            whereQuery[field][operator] = value;
          } else {
            whereQuery[field] = value;
          }
        }
      }
    }
    
    // Add type and status to where query if provided
    if (type) whereQuery.type = type;
    if (status) whereQuery.status = status;
    
    const productsData = await getProducts(page, limit, whereQuery, token);

    // Transform the response to match the expected structure
    const response = {
      products: productsData.docs,
      totalPages: productsData.totalPages,
      currentPage: productsData.page,
      totalProducts: productsData.totalDocs,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching products:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products data';
    
    // Handle specific error cases
    if (errorMessage.includes('Authentication') || errorMessage.includes('401')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 