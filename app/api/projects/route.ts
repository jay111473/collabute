import { getProjects } from "@/lib/get-projects";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
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
    
    const projectsData = await getProjects(page, limit, whereQuery);

    // Transform the response to match the expected structure
    const response = {
      projects: projectsData.docs,
      totalPages: projectsData.totalPages,
      currentPage: projectsData.page,
      totalProjects: projectsData.totalDocs,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects data' },
      { status: 500 }
    );
  }
} 