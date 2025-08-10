"use client";

import { useEffect, useState } from "react";

interface GitHubRepoData {
  stargazers_count: number;
}

export const useGitHubStars = (repo: string) => {
  const [stars, setStars] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://api.github.com/repos/${repo}`, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch repository data');
        }
        
        const data: GitHubRepoData = await response.json();
        setStars(data.stargazers_count);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStars(null);
      } finally {
        setLoading(false);
      }
    };

    if (repo) {
      fetchStars();
    }
  }, [repo]);

  const formatStars = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return {
    stars,
    loading,
    error,
    formatStars: stars !== null ? formatStars(stars) : null,
  };
};
