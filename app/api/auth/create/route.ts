import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("API route /api/auth/create called");
  try {
    const body = await request.json();
    console.log("Request body:", JSON.stringify(body, null, 2));
    
    const {
      name,
      type,
      email,
      password,
      phoneNumber,
      developerFields,
      startupFields,
    } = body;
    
    console.log("Account type:", type);
    if (type === "startup") {
      console.log("Startup fields:", startupFields);
    } else if (type === "developer") {
      console.log("Developer fields:", developerFields);
    }
    
    console.log("Making request to external API:", process.env.NEXT_PUBLIC_API_URL + "/api/users");
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        type,
        email,
        password,
        phoneNumber,
        developerFields,
        startupFields,
      }),
    });
    
    console.log("External API response status:", response.status);
    const responseData = await response.json();
    console.log("External API response:", JSON.stringify(responseData, null, 2));
    
    if (!response.ok) {
      console.error("External API error:", responseData);
      return NextResponse.json(
        { error: responseData.error || "Failed to create user" }, 
        { status: response.status }
      );
    }
    
    console.log("User created successfully:", responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error in API route:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create user" }, 
      { status: 500 }
    );
  }
}
