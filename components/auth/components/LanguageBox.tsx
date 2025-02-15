import { cn } from "@/lib/utils";
import type { ProgrammingLanguage } from "@/types/languages";
import Image from "next/image";
interface LanguageBoxProps {
  language: ProgrammingLanguage;
  isSelected?: boolean;
  onClick?: () => void;
}

export const LanguageBox = ({
  language,
  isSelected = false,
  onClick,
}: LanguageBoxProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:border-black/50 min-h-[120px]",
        isSelected
          ? "border-black bg-black/5"
          : "border-slate-200 hover:bg-slate-50"
      )}
    >
      <div className="w-12 h-12 mb-3 flex items-center justify-center">
        <Image
          src={language.iconPath ?? ""}
          alt={language.name}
          width={48}
          height={48}
        />
      </div>
      <span className="text-sm font-medium text-center">{language.name}</span>
    </div>
  );
}; 