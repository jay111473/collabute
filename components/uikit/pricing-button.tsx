import { ButtonHTMLAttributes } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PricingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "disabled" | "darkPrimary";
  className?: string;
  tooltipText?: string;
}

export function PricingButton({ 
  variant = "primary", 
  className = "", 
  children, 
  disabled,
  tooltipText,
  ...props 
}: PricingButtonProps) {
  const baseClasses = "w-full py-4 px-6 rounded-xl font-medium text-sm transition-all duration-300 relative overflow-hidden group";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-white to-gray-100 text-black hover:from-gray-100 hover:to-white hover:shadow-lg hover:shadow-white/20 transform hover:translate-y-[-2px] active:translate-y-0",
    secondary: "bg-gradient-to-r from-gray-800 to-gray-700 text-white border border-white/20 hover:from-gray-700 hover:to-gray-600 hover:border-white/30 transform hover:translate-y-[-2px] active:translate-y-0",
    darkPrimary: "bg-gradient-to-r from-darkPrimary to-darkPrimary/90 text-white hover:from-darkPrimary/90 hover:to-darkPrimary hover:shadow-lg hover:shadow-darkPrimary/20 transform hover:translate-y-[-2px] active:translate-y-0",
    disabled: "cursor-not-allowed"
  };

  const currentVariant = variant;

  const buttonContent = (
    <button 
      className={`${baseClasses} ${variantClasses[currentVariant]} ${disabled ? variantClasses.disabled : ""} ${className}`}
      disabled={disabled}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center space-x-2">
        {children}
      </span>
      {!disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      )}
    </button>
  );

  if (disabled && tooltipText) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {buttonContent}
        </TooltipTrigger>
        <TooltipContent className="bg-darkGray border-white/20 text-white">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
}