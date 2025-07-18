import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const repoFullName = searchParams.get("repoFullName");
    const filePath = searchParams.get("filePath");
    
    if (!repoFullName || !filePath) {
      return Response.json(
        { error: "Repository full name and file path are required" },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    
    // GitHub API URL for file content
    const githubUrl = `https://api.github.com/repos/${repoFullName}/contents/${filePath}`;

    const response = await fetch(githubUrl, {
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Collabute-Alexandria"
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return Response.json(
          { error: "File not found" },
          { status: 404 }
        );
      }
      if (response.status === 401) {
        return Response.json(
          { error: "GitHub authentication failed. Please reconnect your account." },
          { status: 401 }
        );
      }
      if (response.status === 403) {
        return Response.json(
          { error: "GitHub API rate limit exceeded or insufficient permissions." },
          { status: 403 }
        );
      }
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle directory vs file
    if (Array.isArray(data)) {
      return Response.json(
        { error: "Path is a directory, not a file" },
        { status: 400 }
      );
    }

    // Decode base64 content
    if (data.encoding === "base64") {
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      
      return Response.json({
        content,
        path: data.path,
        name: data.name,
        size: data.size,
        sha: data.sha,
        url: data.html_url,
        type: data.type
      });
    }

    return Response.json(
      { error: "Unsupported file encoding" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error fetching file content:", error);
    return Response.json(
      { error: "Failed to fetch file content" },
      { status: 500 }
    );
  }
}