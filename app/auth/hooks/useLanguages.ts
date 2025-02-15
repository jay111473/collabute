import { useMemo } from "react";
import { DeveloperRole } from "@/types/auth.types";
import { PROGRAMMING_LANGUAGES } from "@/types/languages";

export const useLanguages = (role?: DeveloperRole | null) => {
  const { suggestedLanguages, otherLanguages } = useMemo(() => {
    if (!role) {
      return {
        suggestedLanguages: [],
        otherLanguages: PROGRAMMING_LANGUAGES,
      };
    }

    const suggested = PROGRAMMING_LANGUAGES.filter((lang) =>
      lang.suggestedFor.includes(role)
    );
    const others = PROGRAMMING_LANGUAGES.filter(
      (lang) => !lang.suggestedFor.includes(role)
    );

    return {
      suggestedLanguages: suggested,
      otherLanguages: others,
    };
  }, [role]);

  return {
    suggestedLanguages,
    otherLanguages,
  };
}; 