"use client";

import React, { forwardRef } from "react";
import { Input, InputProps } from "../ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompType extends Omit<InputProps, "onChange"> {
  wrapperClassName?: string;
  onChange?: (value: string) => any;
}

export const SearchInput = forwardRef<HTMLInputElement, CompType>(
  ({ children, wrapperClassName, onChange, ...props }, ref) => {
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      onChange?.(e?.target?.value);
    };
    return (
      <div className={cn("flex relative", wrapperClassName)}>
        <Search
          size={16}
          className="absolute left-2 top-1/2 translate-y-[-50%]"
        />
        <Input
          ref={ref as any}
          onChange={handleChange}
          {...(props as any)}
          className={cn(
            "pr-7 pl-8 bg-transparent rounded-3xl",
            props?.className
          )}
        />
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
