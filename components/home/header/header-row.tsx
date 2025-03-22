"use client";

import React from "react";

type HeaderRowProps = {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  className?: string;
};

const HeaderRow = ({
  title = "AI Sport coach, plans, meals",
  subtitle = "Yesterday",
  icon,
  className = "",
}: HeaderRowProps) => {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <div className="bg-neutral-800 p-2 rounded-lg">
        {icon || (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M12 6L14 4M14 4L16 6M14 4V8M18 8L20 10M20 10L18 12M20 10H16M14 16L16 18M16 18L14 20M16 18H12M6 12L4 14M4 14L6 16M4 14H8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <div className="flex flex-col">
        <span className="font-medium text-white">{title}</span>
        <p className="text-xs text-white/60">{subtitle}</p>
      </div>
    </div>
  );
};

export default HeaderRow; 