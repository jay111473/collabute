"use client";

import React, { useState, useEffect } from "react";
import { Globe, Github, Users, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WebsitePreviewProps {
  url: string;
  className?: string;
}

export const WebsitePreview: React.FC<WebsitePreviewProps> = ({
  url,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<{
    title?: string;
    description?: string;
    favicon?: string;
  } | null>(null);
  const [debouncedUrl, setDebouncedUrl] = useState(url);

  const isValidUrl = (url: string) => {
    if (!url || url.trim().length === 0) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  // Debounce the URL input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUrl(url);
    }, 2000);

    return () => clearTimeout(timer);
  }, [url]);

  useEffect(() => {
    if (!debouncedUrl || !isValidUrl(debouncedUrl)) {
      setPreviewData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Fetch real website metadata
    const fetchMetadata = async () => {
      try {
        const response = await fetch(
          `/api/social-preview/website?url=${encodeURIComponent(debouncedUrl)}`
        );
        if (response.ok) {
          const metadata = await response.json();
          setPreviewData({
            title: metadata.title,
            description: metadata.description,
            favicon: metadata.favicon,
          });
        } else {
          // Fallback for failed requests
          const domain = new URL(debouncedUrl).hostname;
          setPreviewData({
            title: `Portfolio - ${domain}`,
            description: "Personal portfolio and professional showcase",
            favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
          });
        }
      } catch (error) {
        // Fallback for network errors
        const domain = new URL(debouncedUrl).hostname;
        setPreviewData({
          title: `Portfolio - ${domain}`,
          description: "Personal portfolio and professional showcase",
          favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [debouncedUrl]);

  if (!url || !isValidUrl(url)) return null;

  return (
    <Card className={`mt-3 border-gray-700 bg-gray-800/50 ${className}`}>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex items-center space-x-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-600 rounded"></div>
            <div className="flex-1">
              <div className="w-3/4 h-4 bg-gray-600 rounded mb-2"></div>
              <div className="w-full h-3 bg-gray-700 rounded"></div>
            </div>
          </div>
        ) : previewData ? (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {previewData.favicon ? (
                <img
                  src={previewData.favicon}
                  alt="favicon"
                  className="w-8 h-8 rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (
                      e.target as HTMLImageElement
                    ).nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <Globe className="w-8 h-8 text-blue-400 hidden" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-sm truncate">
                {previewData.title}
              </h4>
              <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                {previewData.description}
              </p>
              <div className="flex items-center mt-2 text-xs text-blue-400">
                <ExternalLink className="w-3 h-3 mr-1" />
                {new URL(url).hostname}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

interface GitHubPreviewProps {
  username: string;
  className?: string;
}

export const GitHubPreview: React.FC<GitHubPreviewProps> = ({
  username,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<{
    name?: string;
    bio?: string;
    followers?: number;
    repositories?: number;
    avatar?: string;
  } | null>(null);

  const [debouncedUsername, setDebouncedUsername] = useState(username);

  const extractUsername = (input: string) => {
    if (!input) return "";
    // Handle full GitHub URLs
    const githubUrlMatch = input.match(/github\.com\/([^\/]+)/);
    if (githubUrlMatch) return githubUrlMatch[1];
    // Handle username only
    return input.replace("@", "");
  };

  const isValidGitHubInput = (input: string) => {
    if (!input || input.trim().length === 0) return false;
    const username = extractUsername(input);
    // GitHub username validation: alphanumeric and hyphens, 1-39 characters
    return /^[a-zA-Z0-9-]{1,39}$/.test(username);
  };

  const cleanUsername = extractUsername(debouncedUsername);

  // Debounce the username input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(username);
    }, 2000);

    return () => clearTimeout(timer);
  }, [username]);

  useEffect(() => {
    if (!debouncedUsername || !isValidGitHubInput(debouncedUsername)) {
      setProfileData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Fetch real GitHub profile data
    const fetchGitHubProfile = async () => {
      try {
        const response = await fetch(
          `/api/social-preview/github?username=${encodeURIComponent(cleanUsername)}`
        );
        if (response.ok) {
          const profile = await response.json();
          setProfileData({
            name: profile.name || profile.login,
            bio: profile.bio || "No bio available",
            followers: profile.followers,
            repositories: profile.public_repos,
            avatar: profile.avatar_url,
          });
        } else {
          // Don't show anything if profile doesn't exist or API fails
          setProfileData(null);
        }
      } catch (error) {
        // Don't show anything on network errors
        setProfileData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGitHubProfile();
  }, [debouncedUsername, cleanUsername]);

  if (!cleanUsername) return null;

  return (
    <Card className={`mt-3 border-gray-700 bg-gray-800/50 ${className}`}>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex items-center space-x-3 animate-pulse">
            <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
            <div className="flex-1">
              <div className="w-2/3 h-4 bg-gray-600 rounded mb-2"></div>
              <div className="w-full h-3 bg-gray-700 rounded mb-2"></div>
              <div className="w-1/2 h-3 bg-gray-700 rounded"></div>
            </div>
          </div>
        ) : profileData ? (
          <div className="flex items-start space-x-3">
            <img
              src={profileData.avatar}
              alt={`${cleanUsername} avatar`}
              className="w-10 h-10 rounded-full border border-gray-600"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://via.placeholder.com/40x40/374151/9CA3AF?text=${cleanUsername.charAt(0).toUpperCase()}`;
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <Github className="w-4 h-4 text-gray-400" />
                <h4 className="text-white font-medium text-sm truncate">
                  {profileData.name}
                </h4>
              </div>
              <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                {profileData.bio}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-300">
                <span className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {profileData.followers} followers
                </span>
                <span>{profileData.repositories} repos</span>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

interface XPreviewProps {
  username: string;
  className?: string;
}

export const XPreview: React.FC<XPreviewProps> = ({
  username,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<{
    name?: string;
    bio?: string;
    followers?: number;
    avatar?: string;
  } | null>(null);

  const [debouncedUsername, setDebouncedUsername] = useState(username);

  const extractUsername = (input: string) => {
    if (!input) return "";
    // Handle full X/Twitter URLs
    const xUrlMatch = input.match(/(?:twitter|x)\.com\/([^\/]+)/);
    if (xUrlMatch) return xUrlMatch[1];
    // Handle username only
    return input.replace("@", "");
  };

  const isValidXInput = (input: string) => {
    if (!input || input.trim().length === 0) return false;
    const username = extractUsername(input);
    // X/Twitter username validation: alphanumeric and underscores, 1-15 characters
    return /^[a-zA-Z0-9_]{1,15}$/.test(username);
  };

  const cleanUsername = extractUsername(debouncedUsername);

  // Debounce the username input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(username);
    }, 2000);

    return () => clearTimeout(timer);
  }, [username]);

  useEffect(() => {
    if (!debouncedUsername || !isValidXInput(debouncedUsername)) {
      setProfileData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // For X/Twitter, we'll show a simple verification that the username format is valid
    // X API v2 requires authentication and has strict rate limits
    // We'll show a basic preview indicating the profile link is properly formatted
    setTimeout(() => {
      setProfileData({
        name: `@${cleanUsername}`,
        bio: "Profile link validated • Click to visit on X",
        followers: 0, // Don't show fake follower counts
        avatar: `https://ui-avatars.com/api/?name=${cleanUsername}&background=000000&color=ffffff&size=40&bold=true`,
      });
      setIsLoading(false);
    }, 500);
  }, [debouncedUsername, cleanUsername]);

  if (!cleanUsername) return null;

  return (
    <Card className={`mt-3 border-gray-700 bg-gray-800/50 ${className}`}>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex items-center space-x-3 animate-pulse">
            <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
            <div className="flex-1">
              <div className="w-2/3 h-4 bg-gray-600 rounded mb-2"></div>
              <div className="w-full h-3 bg-gray-700 rounded mb-2"></div>
              <div className="w-1/2 h-3 bg-gray-700 rounded"></div>
            </div>
          </div>
        ) : profileData ? (
          <div className="flex items-start space-x-3">
            <img
              src={profileData.avatar}
              alt={`${cleanUsername} avatar`}
              className="w-10 h-10 rounded-full border border-gray-600"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <h4 className="text-white font-medium text-sm truncate">
                  @{cleanUsername}
                </h4>
              </div>
              <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                {profileData.bio}
              </p>
              {profileData.followers && (
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-300">
                  <span className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {profileData.followers.toLocaleString()} followers
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
