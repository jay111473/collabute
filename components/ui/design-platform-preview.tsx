"use client";

import React, { useState, useEffect } from "react";
import { Heart, Eye, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DribbblePreviewProps {
  url: string;
  className?: string;
}

export const DribbblePreview: React.FC<DribbblePreviewProps> = ({
  url,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<{
    name?: string;
    bio?: string;
    followers?: number;
    likes?: number;
    shots?: number;
    avatar?: string;
  } | null>(null);

  const [debouncedUrl, setDebouncedUrl] = useState(url);

  const extractUsername = (input: string) => {
    if (!input) return "";
    const dribbbleUrlMatch = input.match(/dribbble\.com\/([^\/]+)/);
    if (dribbbleUrlMatch) return dribbbleUrlMatch[1];
    return input.replace("@", "");
  };

  const isValidDribbbleInput = (input: string) => {
    if (!input || input.trim().length === 0) return false;
    const username = extractUsername(input);
    // Dribbble username validation: alphanumeric, underscores, hyphens, 1-30 characters
    return /^[a-zA-Z0-9_-]{1,30}$/.test(username);
  };

  const cleanUsername = extractUsername(debouncedUrl);

  // Debounce the URL input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUrl(url);
    }, 2000);

    return () => clearTimeout(timer);
  }, [url]);

  useEffect(() => {
    if (!debouncedUrl || !isValidDribbbleInput(debouncedUrl)) {
      setProfileData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // For Dribbble, we'll validate the profile format and show a basic preview
    // without fake metrics since we don't have API access
    setTimeout(() => {
      setProfileData({
        name: cleanUsername,
        bio: "Dribbble profile link validated",
        followers: 0, // Don't show fake data
        likes: 0,
        shots: 0,
        avatar: `https://ui-avatars.com/api/?name=${cleanUsername}&background=EA4C89&color=fff&size=40&bold=true`,
      });
      setIsLoading(false);
    }, 500);
  }, [debouncedUrl, cleanUsername]);

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
                <div className="w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <h4 className="text-white font-medium text-sm truncate">
                  {profileData.name}
                </h4>
              </div>
              <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                {profileData.bio}
              </p>
              {profileData.followers &&
                profileData.likes &&
                profileData.shots && (
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-300">
                    {profileData.followers && (
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {profileData.followers}
                      </span>
                    )}
                    {profileData.likes > 0 && (
                      <span className="flex items-center">
                        <Heart className="w-3 h-3 mr-1" />
                        {profileData.likes}
                      </span>
                    )}
                    {profileData.shots > 0 && (
                      <span>{profileData.shots} shots</span>
                    )}
                  </div>
                )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

interface BehancePreviewProps {
  url: string;
  className?: string;
}

export const BehancePreview: React.FC<BehancePreviewProps> = ({
  url,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<{
    name?: string;
    bio?: string;
    followers?: number;
    appreciations?: number;
    projects?: number;
    avatar?: string;
  } | null>(null);

  const [debouncedUrl, setDebouncedUrl] = useState(url);

  const extractUsername = (input: string) => {
    if (!input) return "";
    const behanceUrlMatch = input.match(/behance\.net\/([^\/]+)/);
    if (behanceUrlMatch) return behanceUrlMatch[1];
    return input.replace("@", "");
  };

  const isValidBehanceInput = (input: string) => {
    if (!input || input.trim().length === 0) return false;
    const username = extractUsername(input);
    // Behance username validation: alphanumeric, underscores, hyphens, 1-30 characters
    return /^[a-zA-Z0-9_-]{1,30}$/.test(username);
  };

  const cleanUsername = extractUsername(debouncedUrl);

  // Debounce the URL input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUrl(url);
    }, 2000);

    return () => clearTimeout(timer);
  }, [url]);

  useEffect(() => {
    if (!debouncedUrl || !isValidBehanceInput(debouncedUrl)) {
      setProfileData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // For Behance, we'll validate the profile format and show a basic preview
    setTimeout(() => {
      setProfileData({
        name: cleanUsername,
        bio: "Behance profile link validated",
        followers: 0, // Don't show fake data
        appreciations: 0,
        projects: 0,
        avatar: `https://ui-avatars.com/api/?name=${cleanUsername}&background=1769FF&color=fff&size=40&bold=true`,
      });
      setIsLoading(false);
    }, 500);
  }, [debouncedUrl, cleanUsername]);

  if (!cleanUsername) return null;

  return (
    <Card className={`mt-3 border-gray-700 bg-gray-800/50 ${className}`}>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex items-center space-x-3 animate-pulse">
            <div className="w-10 h-10 bg-gray-600 rounded"></div>
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
              className="w-10 h-10 rounded border border-gray-600"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">Be</span>
                </div>
                <h4 className="text-white font-medium text-sm truncate">
                  {profileData.name}
                </h4>
              </div>
              <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                {profileData.bio}
              </p>
              {profileData.followers &&
                profileData.appreciations &&
                profileData.projects && (
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-300">
                    {profileData.followers && (
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {profileData.followers}
                      </span>
                    )}
                    {profileData.appreciations > 0 && (
                      <span className="flex items-center">
                        <Heart className="w-3 h-3 mr-1" />
                        {profileData.appreciations}
                      </span>
                    )}
                    {profileData.projects > 0 && (
                      <span>{profileData.projects} projects</span>
                    )}
                  </div>
                )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

interface LayersPreviewProps {
  url: string;
  className?: string;
}

export const LayersPreview: React.FC<LayersPreviewProps> = ({
  url,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<{
    name?: string;
    bio?: string;
    followers?: number;
    works?: number;
    avatar?: string;
  } | null>(null);

  const [debouncedUrl, setDebouncedUrl] = useState(url);

  const extractUsername = (input: string) => {
    if (!input) return "";
    const layersUrlMatch = input.match(/layers\.to\/([^\/]+)/);
    if (layersUrlMatch) return layersUrlMatch[1];
    return input.replace("@", "");
  };

  const isValidLayersInput = (input: string) => {
    if (!input || input.trim().length === 0) return false;
    const username = extractUsername(input);
    // Layers username validation: alphanumeric, underscores, hyphens, 1-30 characters
    return /^[a-zA-Z0-9_-]{1,30}$/.test(username);
  };

  const cleanUsername = extractUsername(debouncedUrl);

  // Debounce the URL input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUrl(url);
    }, 2000);

    return () => clearTimeout(timer);
  }, [url]);

  useEffect(() => {
    if (!debouncedUrl || !isValidLayersInput(debouncedUrl)) {
      setProfileData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // For Layers, we'll validate the profile format and show a basic preview
    setTimeout(() => {
      setProfileData({
        name: cleanUsername,
        bio: "Layers.io profile link validated",
        followers: 0, // Don't show fake data
        works: 0,
        avatar: `https://ui-avatars.com/api/?name=${cleanUsername}&background=374151&color=fff&size=40&bold=true`,
      });
      setIsLoading(false);
    }, 500);
  }, [debouncedUrl, cleanUsername]);

  if (!cleanUsername) return null;

  return (
    <Card className={`mt-3 border-gray-700 bg-gray-800/50 ${className}`}>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex items-center space-x-3 animate-pulse">
            <div className="w-10 h-10 bg-gray-600 rounded"></div>
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
              className="w-10 h-10 rounded border border-gray-600"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-700 rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded"></div>
                </div>
                <h4 className="text-white font-medium text-sm truncate">
                  {profileData.name}
                </h4>
              </div>
              <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                {profileData.bio}
              </p>
              {profileData.followers &&
                profileData.works && (
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-300">
                    {profileData.followers && (
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {profileData.followers} followers
                    </span>
                  )}
                  {profileData.works > 0 && (
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {profileData.works} works
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
