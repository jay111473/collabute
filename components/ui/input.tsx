"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <>
        <style jsx global>{`
          /* Safari-specific autofill styling */
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus,
          input:-webkit-autofill:active {
            -webkit-text-fill-color: white !important;
            -webkit-box-shadow: 0 0 0 30px rgb(18, 18, 18) inset !important;
            transition: background-color 5000s ease-in-out 0s;
          }
        `}</style>
        <input
          type={type}
          className={cn(
            "flex w-full rounded-md px-3 py-3 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 bg-transparent text-white border border-grayBorders placeholder:text-white",
            className
          )}
          ref={ref}
          {...props}
        />
      </>
    );
  }
);
Input.displayName = "Input";

export { Input };
