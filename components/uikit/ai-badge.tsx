import { Sparkles } from "lucide-react";
import React from "react";

interface AIBadgeProps {
  text: string;
}

const AIBadge = ({ text }: AIBadgeProps) => {
  return (
    <div className="relative mb-8 w-max">
      <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-[80px] h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      <div className="relative inline-flex items-center gap-2 px-3 py-2 rounded-full border border-white/20">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <span className="text-xs font-medium text-white">{text}</span>
      </div>
    </div>
  );
};

export default AIBadge;
