import { getUser } from "@/lib/get-user";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const depth = parseInt(searchParams.get('depth') || '1');
    
    const user = await getUser(depth);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user data';
    
    // Handle specific error cases
    if (errorMessage.includes('Authentication required') || errorMessage.includes('Authentication failed')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 401 }
      );
    }
    
    if (errorMessage.includes('User not found')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 