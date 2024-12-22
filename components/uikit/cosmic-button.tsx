import { ButtonHTMLAttributes } from "react";

interface CosmicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function CosmicButton({ className, children, ...props }: CosmicButtonProps) {
  return (
    <button 
      className="cosmic-button px-6 py-2 text-sm"
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
} 