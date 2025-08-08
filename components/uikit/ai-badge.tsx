import GlowIcon from "@/public/icons/glow-icon";

interface AIBadgeProps {
  text: string;
}

const AIBadge = ({ text }: AIBadgeProps) => {
  return (
    <div className="relative mb-4 md:mb-8 w-max">
      <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-[80px] h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      <div className="relative inline-flex items-center gap-2 px-3 py-2 rounded-full overflow-hidden group">
        {/* Base border */}
        <div className="absolute inset-0 rounded-full border border-white/20" />
        
        {/* Animated shine effect */}
        <div className="absolute inset-0 rounded-full">
          <div className="absolute inset-0 rounded-full animate-shine-rotate">
            <div className="absolute w-full h-full rounded-full bg-gradient-conic from-transparent via-white/40 to-transparent blur-sm" />
          </div>
        </div>
        
        {/* Inner mask to hide the center of the shine */}
        <div className="absolute inset-[1px] rounded-full bg-background z-10" />
        
        {/* Content */}
        <div className="relative z-20 flex items-center gap-2">
          <GlowIcon />
          <span className="text-xs md:text-sm font-medium text-white">
            {text}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIBadge;
