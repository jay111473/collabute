import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/get-user";
import { cookies } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (user.type !== "developer") {
      return NextResponse.json(
        { error: "Only developers can request collaboration" },
        { status: 403 }
      );
    }

    // First, fetch the issue to get the project information
    const issueResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/issues/${resolvedParams.id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!issueResponse.ok) {
      return NextResponse.json(
        { error: "Issue not found" },
        { status: 404 }
      );
    }

    const issue = await issueResponse.json();
    
    // Check if the user is a collaborator on this project
    const isCollaborator = issue.project?.collabuters?.some(
      (collaborator: any) => {
        return collaborator.collabuter?.id === user.id && collaborator.status === "active";
      }
    );

    if (!isCollaborator) {
      return NextResponse.json(
        { error: "Only existing collaborators can request collaboration on this issue" },
        { status: 403 }
      );
    }

    const { percentageShare, taskDefinition } = await request.json();

    if (!percentageShare || !taskDefinition) {
      return NextResponse.json(
        { error: "Percentage share and task definition are required" },
        { status: 400 }
      );
    }

    if (percentageShare < 1 || percentageShare > 100) {
      return NextResponse.json(
        { error: "Percentage share must be between 1 and 100" },
        { status: 400 }
      );
    }

    // TODO: Replace with actual API call to your backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/issues/${resolvedParams.id}/collaboration-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        developer: user.id,
        percentageShare,
        taskDefinition,
        status: "pending",
        requestedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || "Failed to submit collaboration request" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Collaboration request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // TODO: Replace with actual API call to your backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/issues/${resolvedParams.id}/collaboration-requests`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || "Failed to fetch collaboration requests" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch collaboration requests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}