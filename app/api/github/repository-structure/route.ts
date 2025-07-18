import { NextRequest } from "next/server";

interface GitHubTreeItem {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
}

interface GitHubTree {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const repoFullName = searchParams.get("repoFullName");
    const branch = searchParams.get("branch") || "main";
    
    if (!repoFullName) {
      return Response.json(
        { error: "Repository full name is required" },
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
    
    // GitHub API URL for repository tree (recursive)
    const githubUrl = `https://api.github.com/repos/${repoFullName}/git/trees/${branch}?recursive=1`;

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
          { error: "Repository or branch not found" },
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

    const data: GitHubTree = await response.json();
    
    // Filter and organize the tree structure
    const files = data.tree
      .filter(item => item.type === "blob")
      .map(item => ({
        path: item.path,
        size: item.size,
        type: getFileType(item.path),
        extension: getFileExtension(item.path),
        sha: item.sha
      }));

    const directories = data.tree
      .filter(item => item.type === "tree")
      .map(item => ({
        path: item.path,
        type: "directory" as const,
        sha: item.sha
      }));

    // Analyze project structure
    const analysis = analyzeProjectStructure(files);

    return Response.json({
      repoFullName,
      branch,
      totalFiles: files.length,
      totalDirectories: directories.length,
      files: files.slice(0, 100), // Limit to first 100 files
      directories: directories.slice(0, 50), // Limit to first 50 directories
      analysis,
      truncated: data.truncated
    });

  } catch (error) {
    console.error("Error fetching repository structure:", error);
    return Response.json(
      { error: "Failed to fetch repository structure" },
      { status: 500 }
    );
  }
}

function getFileExtension(path: string): string {
  const parts = path.split(".");
  return parts.length > 1 ? parts.pop()! : "";
}

function getFileType(path: string): string {
  const extension = getFileExtension(path).toLowerCase();
  const typeMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    java: "java",
    cpp: "cpp",
    c: "c",
    h: "c",
    cs: "csharp",
    php: "php",
    rb: "ruby",
    go: "go",
    rs: "rust",
    swift: "swift",
    kt: "kotlin",
    dart: "dart",
    html: "html",
    css: "css",
    scss: "scss",
    sass: "sass",
    less: "less",
    json: "json",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown",
    txt: "text",
    sql: "sql",
    sh: "shell",
    bash: "shell",
    dockerfile: "docker",
    makefile: "makefile",
    gitignore: "git"
  };
  
  return typeMap[extension] || "unknown";
}

function analyzeProjectStructure(files: any[]) {
  const languages: Record<string, number> = {};
  const frameworks: string[] = [];
  
  files.forEach(file => {
    if (file.type !== "unknown") {
      languages[file.type] = (languages[file.type] || 0) + 1;
    }
  });

  // Detect frameworks based on files
  const filePaths = files.map(f => f.path);
  
  if (filePaths.some(p => p.includes("package.json"))) {
    frameworks.push("Node.js");
  }
  if (filePaths.some(p => p.includes("next.config") || p.includes("pages/") || p.includes("app/"))) {
    frameworks.push("Next.js");
  }
  if (filePaths.some(p => p.includes("angular.json"))) {
    frameworks.push("Angular");
  }
  if (filePaths.some(p => p.includes("vue.config") || p.includes(".vue"))) {
    frameworks.push("Vue.js");
  }
  if (filePaths.some(p => p.includes("requirements.txt") || p.includes("setup.py"))) {
    frameworks.push("Python");
  }
  if (filePaths.some(p => p.includes("Cargo.toml"))) {
    frameworks.push("Rust");
  }
  if (filePaths.some(p => p.includes("pom.xml") || p.includes("build.gradle"))) {
    frameworks.push("Java");
  }
  if (filePaths.some(p => p.includes("Dockerfile"))) {
    frameworks.push("Docker");
  }
  if (filePaths.some(p => p.includes("docker-compose"))) {
    frameworks.push("Docker Compose");
  }
  if (filePaths.some(p => p.includes("tailwind.config"))) {
    frameworks.push("Tailwind CSS");
  }
  if (filePaths.some(p => p.includes("tsconfig.json"))) {
    frameworks.push("TypeScript");
  }

  return {
    languages,
    frameworks,
    hasTests: filePaths.some(p => p.includes("test") || p.includes("spec")),
    hasDocumentation: filePaths.some(p => p.toLowerCase().includes("readme") || p.includes("docs/")),
    hasDocker: filePaths.some(p => p.includes("Dockerfile")),
    hasCI: filePaths.some(p => p.includes(".github/workflows") || p.includes(".gitlab-ci") || p.includes("jenkins")),
    hasLinting: filePaths.some(p => p.includes("eslint") || p.includes("prettier") || p.includes("tslint")),
    hasPackageManager: filePaths.some(p => p.includes("package.json") || p.includes("yarn.lock") || p.includes("pnpm-lock")),
    configFiles: filePaths.filter(p => 
      p.includes("config") || 
      p.includes(".env") || 
      p.includes("settings") ||
      p.endsWith(".json") ||
      p.endsWith(".yaml") ||
      p.endsWith(".yml")
    )
  };
}