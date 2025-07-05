import { getProduct } from "@/lib/get-product";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const productData = await getProduct(id, token);

    if (!productData) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(productData);
  } catch (error) {
    console.error("Error fetching product:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch product data";

    // Handle specific error cases
    if (
      errorMessage.includes("Authentication") ||
      errorMessage.includes("401")
    ) {
      return NextResponse.json({ error: errorMessage }, { status: 401 });
    }

    if (errorMessage.includes("not found") || errorMessage.includes("404")) {
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
