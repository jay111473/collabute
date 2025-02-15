"use client";

import { useState } from "react";
import { CategorySelector } from "@/components/auth/CategorySelector";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function CategoryPage() {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleCategorySelect = (categories: string[]) => {
    setSelectedCategories(categories);
    setError(null); // Clear any previous errors
  };

  const handleContinue = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get languages from previous step
      const languages = JSON.parse(localStorage.getItem("selectedLanguages") || "[]");
      
      // Save selected categories
      localStorage.setItem("selectedCategories", JSON.stringify(selectedCategories));
      
      // Generate time management challenge
      const response = await fetch("/api/challenge/time-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ languages, categories: selectedCategories }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate challenge");
      }

      const data = await response.json();
      
      // Validate the response structure
      if (!data?.scenario?.options) {
        throw new Error("Invalid challenge data received");
      }
      
      // Save the scenario for the next page
      localStorage.setItem("timeManagementScenario", JSON.stringify(data));
      
      // Navigate to time management challenge
      router.push("/auth/create-account/challenge/time-management");
    } catch (err) {
      console.error("Challenge generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate challenge. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 bg-black">
      <div className="w-full max-w-6xl space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <Image src="/logo.svg" alt="logo" width={66} height={66} />
          <h1 className="text-3xl font-bold text-white">Choose Your Industry Categories</h1>
          <p className="text-gray-400 max-w-xl">
            Select up to 3 categories that best match your expertise and interests. This helps us match you with relevant projects.
          </p>
        </div>

        <div className="space-y-8">
          <CategorySelector onSelect={handleCategorySelect} />
          
          {selectedCategories.length >= 3 && (
            <p className="text-center text-amber-500 text-sm">
              Maximum 3 categories can be selected
            </p>
          )}

          {error && (
            <p className="text-center text-red-500">{error}</p>
          )}

          <div className="flex justify-center pt-4 gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              disabled={isLoading}
              className="min-w-[200px] border-[1px] border-zinc-800 bg-transparent text-white hover:bg-zinc-900 hover:text-white"
            >
              Back
            </Button>
            <Button
              size="lg"
              disabled={selectedCategories.length === 0 || isLoading}
              onClick={handleContinue}
              className={cn(
                "min-w-[200px] text-white",
                selectedCategories.length > 0 && !isLoading
                  ? "bg-primary hover:bg-primary/90"
                  : "bg-zinc-800 text-zinc-500"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Challenge...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
