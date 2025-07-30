import { ButtonHTMLAttributes } from "react";

interface CosmicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function CosmicButton({ className, children, ...props }: CosmicButtonProps) {
  return (
    <button 
      className="cosmic-button px-4 py-2 md:px-6 md:py-4 text-xs md:text-sm text-white"
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
} 