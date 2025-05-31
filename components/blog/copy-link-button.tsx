"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface CopyLinkButtonProps {
  className?: string;
}

export const CopyLinkButton = ({ className = "" }: CopyLinkButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  return (
    <button
      onClick={handleCopyLink}
      className={`relative overflow-hidden transition-all duration-200 ${className}`}
    >
      <span
        className={`inline-block transition-all duration-300 ease-in-out ${
          copied 
            ? "transform -translate-y-full opacity-0" 
            : "transform translate-y-0 opacity-100"
        }`}
      >
        Copy link
      </span>
      
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out ${
          copied 
            ? "transform translate-y-0 opacity-100" 
            : "transform translate-y-full opacity-0"
        }`}
      >
        <div className="flex items-center gap-1 text-darkPrimary ml-2 w-full text-center">
          Copied!
        </div>
      </span>
    </button>
  );
}; 