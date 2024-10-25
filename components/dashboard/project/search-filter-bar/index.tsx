"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import React, { useState } from "react";

type SearchFilterBarProps = {
  placeholder: string;
  className?: string;
  filters?: {
    label: string;
    value: string;
    icon: React.ReactNode;
  }[];
  onChange: (value: string) => void;
};

const SearchFilterBar = ({
  placeholder,
  className,
  filters,
  onChange,
}: SearchFilterBarProps) => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  return (
    <div className={cn("flex justify-start items-center gap-2", className)}>
      <Input
        className="w-[450px] p-2 text-black placeholder:text-gray-400 rounded-3xl"
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {filters?.map((filter) => (
        <Badge
          variant="outline"
          key={filter.value}
          className={cn(
            "rounded-3xl font-medium text-sm cursor-pointer py-2.5 px-4",
            selectedFilter === filter.value && "border-primary text-primary"
          )}
          onClick={() =>
            setSelectedFilter((prevFilter) =>
              prevFilter === filter.value ? null : filter.value
            )
          }
        >
          {filter.icon}
          {filter.label}
        </Badge>
      ))}
    </div>
  );
};

export default SearchFilterBar;
