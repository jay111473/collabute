import GlowIcon from "@/public/icons/glow-icon";

interface AIBadgeProps {
  text: string;
}

const AIBadge = ({ text }: AIBadgeProps) => {
  return (
    <div className="relative mb-4 md:mb-8 w-max">
      <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-[80px] h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      <div className="relative inline-flex items-center gap-2 px-3 py-2 rounded-full border border-white/20">
        <GlowIcon />
        <span className="text-xs md:text-sm font-medium text-white">
          {text}
        </span>
      </div>
    </div>
  );
};

export default AIBadge;
