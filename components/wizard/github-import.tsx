import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import GithubIcon from "@/public/icons/github";
import { Loader2, AlertCircle, GitBranchIcon, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface Repository {
  repoId: string;
  name: string;
  fullName: string;
  url: string;
  isPrivate: boolean;
  description?: string;
  language?: string;
  defaultBranch?: string;
  stargazers_count?: number;
  forks_count?: number;
  updated_at?: string;
}

interface GitHubImportProps {
  onImportComplete: (repository: Repository) => void;
  userid: string;
  token: string;
}

export function GitHubImport({
  onImportComplete,
  userid,
  token,
}: GitHubImportProps) {
  const searchParams = useSearchParams();
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalRepos, setTotalRepos] = useState(0);
  
  const observerTarget = useRef(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Check if we were redirected back from GitHub OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get("github_auth_success");
    const authError = urlParams.get("github_auth_error");

    if (authError) {
      setError(
        `GitHub authentication failed: ${decodeURIComponent(authError)}`
      );
      return;
    }

    if (authSuccess === "true") {
      // Fetch repositories when auth is successful
      fetchRepositories(1, "");
    }
  }, []);

  // Listen for changes in the debounced search term
  useEffect(() => {
    // Only trigger search if we have initialized the component
    if (repositories.length > 0 || isLoading) {
      setPage(1);
      fetchRepositories(1, debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
  
  // Setup infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isLoadingMore && !isLoading) {
          loadMoreRepositories();
        }
      },
      { threshold: 0.5 }
    );
    
    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }
    
    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isLoadingMore, isLoading, page]);

  const fetchRepositories = async (pageNumber: number, query: string, append: boolean = false) => {
    try {
      if (pageNumber === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      setError(null);

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      // Build the URL with pagination and search parameters
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/github/wizard-repositories?page=${pageNumber}&limit=10`;
      
      if (userid) {
        url += `&userId=${userid}`;
      }
      
      if (query) {
        url += `&search=${encodeURIComponent(query)}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "You are not authorized to access this resource. Please reconnect your GitHub account."
        );
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch repositories: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract pagination info
      const pagination = data.pagination || { 
        totalCount: 0, 
        hasNextPage: false 
      };
      
      setTotalRepos(pagination.totalCount || 0);
      setHasNextPage(pagination.hasNextPage || false);
      
      if (append && pageNumber > 1) {
        // Append repositories for infinite scroll
        setRepositories(prev => [...prev, ...(data.repositories || [])]);
      } else {
        // Replace repositories for new search or initial load
        setRepositories(data.repositories || []);
      }
      
      if (data.repositories?.length === 0 && pageNumber === 1) {
        console.log("No repositories found matching the criteria");
      }
    } catch (err) {
      console.error("Error fetching repositories:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch repositories. Please try again."
      );
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsConnecting(false);
    }
  };
  
  const loadMoreRepositories = () => {
    if (hasNextPage && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchRepositories(nextPage, debouncedSearchTerm, true);
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const clearSearch = () => {
    setSearchTerm("");
    // Don't need to call fetchRepositories directly,
    // the useEffect hook will handle that when debouncedSearchTerm changes
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleGitHubConnect = () => {
    // Check auth prerequisites before proceeding
    if (!checkAuthPrerequisites()) {
      return;
    }

    setIsConnecting(true);

    // Get the current step from the URL
    const currentStep = searchParams.get("step") || "1.5";
    // Construct the callback URL to return to the wizard with the same step
    let callbackUrl = `${window.location.origin}/dashboard/wizard?github_auth_success=true&step=${currentStep}`;

    // Add userId to callback if available
    if (userid) {
      callbackUrl += `&userId=${userid}`;
    }

    // Log for debugging
    console.log("Redirecting to GitHub connect with callback:", callbackUrl);

    // Redirect to the GitHub OAuth endpoint
    window.location.href = `${
      process.env.NEXT_PUBLIC_API_URL
    }/api/github/wizard-connect?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  };

  const handleRepoSelect = (repository: Repository) => {
    setSelectedRepo(repository.repoId);
    onImportComplete(repository);
  };

  // Check if we have a user ID and token before allowing GitHub connection
  const checkAuthPrerequisites = () => {
    if (!token) {
      setError("You need to be logged in to connect your GitHub account.");
      return false;
    }

    if (!userid) {
      setError("User ID not found. Please refresh the page or log in again.");
      return false;
    }

    return true;
  };

  // Format date to a friendly string
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="relative min-h-[600px] flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">
            Connect Your GitHub Repository
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Import your existing project from GitHub to continue the setup
            process.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl mx-auto"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-3 text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {repositories.length === 0 && !isLoading ? (
            <Card className="bg-gradient-to-br from-darkPrimary/20 to-darkPrimary/5 border-white/10 p-8 rounded-2xl">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-primary2/20 flex items-center justify-center">
                  <GithubIcon />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-white">
                    Connect Your GitHub Account
                  </h3>
                  <p className="text-gray-400">
                    Connect your GitHub account to import your repositories and
                    continue setting up your project.
                  </p>
                </div>
                <Button
                  onClick={handleGitHubConnect}
                  disabled={isConnecting}
                  className="gap-x-2 bg-white dark:bg-white text-black dark:text-black hover:bg-white/90 dark:hover:bg-white/90 hover:scale-[1.02] transition-all duration-200"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <GithubIcon />
                      Connect GitHub
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">
                  Select a Repository {totalRepos > 0 && <span className="text-sm font-normal text-gray-400 ml-2">({totalRepos} found)</span>}
                </h3>
                <Button
                  variant="outline"
                  onClick={handleGitHubConnect}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Change Account
                </Button>
              </div>
              
              {/* Search input */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  ref={searchInputRef}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search repositories..."
                  className="pl-10 pr-10 py-2 bg-darkPrimary/10 border-gray-700 text-white rounded-lg focus:ring-primary focus:border-primary"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-darkPrimary" />
                  <p className="text-gray-400">Fetching your repositories...</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-4">
                    {repositories.map((repo) => (
                      <motion.div
                        key={repo.repoId}
                        whileHover={{ scale: 1.01 }}
                        className={cn(
                          "cursor-pointer p-4 rounded-xl border transition-all duration-200",
                          "bg-gradient-to-br from-darkPrimary/10 to-darkPrimary/5",
                          selectedRepo === repo.repoId
                            ? "border-primary2"
                            : "border-white/10 hover:border-white/20"
                        )}
                        onClick={() => handleRepoSelect(repo)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-white">
                              {repo.name}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {repo.description || "No description available"}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              {repo.language && <span>{repo.language}</span>}
                              <span className="flex items-center">
                                <GitBranchIcon className="h-3.5 w-3.5 mr-1" />
                                {repo.defaultBranch || "main"}
                              </span>
                              {repo.updated_at && (
                                <span>Updated {formatDate(repo.updated_at)}</span>
                              )}
                              {repo.isPrivate ? (
                                <span className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">
                                  Private
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">
                                  Public
                                </span>
                              )}
                            </div>
                          </div>
                          {selectedRepo === repo.repoId && (
                            <div className="text-primary2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {repositories.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        {searchTerm 
                          ? `No repositories found matching "${searchTerm}"`
                          : "No repositories found. Create a repository on GitHub first or connect a different account."}
                      </div>
                    )}
                  </div>
                  
                  {/* Infinite scroll loading indicator */}
                  {hasNextPage && (
                    <div 
                      ref={observerTarget} 
                      className="flex justify-center items-center py-4"
                    >
                      {isLoadingMore ? (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span className="text-sm text-gray-400">Loading more repositories...</span>
                        </div>
                      ) : (
                        <div className="h-8" /> // Spacer to trigger loading
                      )}
                    </div>
                  )}
                  
                  {!hasNextPage && repositories.length > 0 && (
                    <div className="text-center py-4 text-sm text-gray-500">
                      {repositories.length === totalRepos 
                        ? `Showing all ${totalRepos} repositories` 
                        : `Showing ${repositories.length} of ${totalRepos} repositories`}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
