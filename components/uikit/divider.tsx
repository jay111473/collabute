import React from "react";
import { cn } from "@/lib/utils";

export const Divider: React.FC<
  React.InputHTMLAttributes<HTMLDivElement> & {
    vertical?: boolean;
    dot?: boolean;
  }
> = ({ className, vertical, dot, ...rest }) => {
  return dot ? (
    <div {...rest} className={cn("w-1 bg-grayBorders h-1", className)} />
  ) : vertical ? (
    <div {...rest} className={cn("w-[1px] bg-grayBorders h-full", className)} />
  ) : (
    <div {...rest} className={cn("w-full bg-grayBorders h-[1px]", className)} />
  );
};
Divider.displayName = "Divider";
