import type { ProgrammingLanguage } from "@/types/languages";
import { LanguageBox } from "./LanguageBox";

interface LanguageSectionProps {
  title: string;
  languages: ProgrammingLanguage[];
  selectedLanguages: string[];
  onLanguageSelect: (languageId: string) => void;
}

export const LanguageSection = ({
  title,
  languages,
  selectedLanguages,
  onLanguageSelect,
}: LanguageSectionProps) => {
  if (languages.length === 0) return null;

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {languages.map((language) => (
          <LanguageBox
            key={language.id}
            language={language}
            isSelected={selectedLanguages.includes(language.id)}
            onClick={() => onLanguageSelect(language.id)}
          />
        ))}
      </div>
    </div>
  );
}; 