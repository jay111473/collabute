"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLanguages } from "../../hooks/useLanguages";
import { LanguageSection } from "../../../../components/auth/components/LanguageSection";
import type { DeveloperRole } from "@/types/auth.types";

const Challenge = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") as DeveloperRole | null;
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const { suggestedLanguages, otherLanguages } = useLanguages(role);

  const handleLanguageSelect = (languageId: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(languageId)
        ? prev.filter((id) => id !== languageId)
        : [...prev, languageId]
    );
  };

  const handleContinue = () => {
    // Save selected languages if needed
    // Then navigate to category selection
    router.push("/auth/create-account/challenge/category");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
      <div className="w-full max-w-6xl space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <Image src="/logo.svg" alt="logo" width={66} height={66} />
          <h1 className="text-3xl font-bold">Choose Your Programming Languages</h1>
          <p className="text-slate-600 max-w-xl">
            Select the programming languages you&apos;re most comfortable with. We&apos;ll use
            this information to match you with relevant projects.
          </p>
        </div>

        <div className="space-y-12">
          {suggestedLanguages.length > 0 && (
            <LanguageSection
              title="Suggested Languages"
              languages={suggestedLanguages}
              selectedLanguages={selectedLanguages}
              onLanguageSelect={handleLanguageSelect}
            />
          )}

          <LanguageSection
            title={otherLanguages.length > 0 ? "Other Languages" : "Languages"}
            languages={otherLanguages}
            selectedLanguages={selectedLanguages}
            onLanguageSelect={handleLanguageSelect}
          />
        </div>

        <div className="flex justify-center pt-8">
          <Button
            size="lg"
            disabled={selectedLanguages.length === 0}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Challenge;
