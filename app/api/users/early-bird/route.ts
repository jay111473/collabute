import { NextRequest, NextResponse } from "next/server";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  try {
    const token = process.env.STATIC_EARLY_BIRD_TOKEN;
    console.log(token);
    // Parse request body
    const body = await request.json();
    const { name, email, type, phoneNumber, countryCode } = body;

    // Validate required fields
    if (!name || !email || !type) {
      return NextResponse.json(
        {
          error: "Missing required fields: name, email, and type are required",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate type
    const validTypes = [
      "developer",
      "designer",
      "startup",
      "lead",
      "projectManager",
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          error:
            "Invalid type. Must be one of: developer, designer, startup, lead, projectManager",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Forward the request to the external API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: "API URL not configured" },
        { status: 500, headers: corsHeaders }
      );
    }

    const response = await fetch(`${apiUrl}/api/users/early-bird`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        email,
        type,
        ...(phoneNumber && { phoneNumber }),
        ...(countryCode && { countryCode }),
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      // Handle specific error cases from the external API
      let errorMessage = "Failed to create user";

      switch (response.status) {
        case 400:
          errorMessage = responseData.message || "Invalid request data";
          break;
        case 409:
          errorMessage = "This email is already registered";
          break;
        case 401:
          errorMessage = "Authentication failed";
          break;
        default:
          errorMessage = responseData.message || "An unexpected error occurred";
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status, headers: corsHeaders }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        userId: responseData.userId || responseData.id,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Early bird registration error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
