import React from "react";
import {
  Rocket,
  Sparkles,
  Waves,
  MonitorSmartphone,
} from "lucide-react";
import AIBadge from "@/components/uikit/ai-badge";
import { SpecialCard, SpecialCardContent } from "@/components/ui/special-card";

const Feature = () => {
  return (
    <section className="w-full">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <AIBadge text="Smart solution" />
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            You Think It. We Build It.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Sparkles className="h-8 w-8 text-purple-400" />}
            title="AI-Accelerated Planning"
            description="We turn your idea into a clear, step-by-step plan."
          />
          <FeatureCard
            icon={<Rocket className="h-8 w-8 text-purple-400" />}
            title="Open Source Production"
            description="We build on top of open source projects, ensuring transparency and collaboration."
          />
          <FeatureCard
            icon={<MonitorSmartphone className="h-8 w-8 text-purple-400" />}
            title="Platform Agnostic"
            description="You're not limited to web, mobile, or desktop. We build for all platforms."
          />
          <FeatureCard
            icon={<Waves className="h-8 w-8 text-purple-400" />}
            title="Fluid Framework"
            description="Collabute has no shape, it takes shape around your architecture "
          />
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <SpecialCard className="relative overflow-hidden rounded-[20px] border border-purple-500/20 bg-[#09090b] bg-gradient-to-b from-purple-500/5 to-transparent backdrop-blur-sm transition-all hover:border-purple-500/40">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -inset-x-20 -inset-y-40 from-purple-500/20 via-transparent to-transparent bg-gradient-to-r rotate-12 transform scale-y-[2] group-hover:animate-shine" />
      <SpecialCardContent className="relative flex flex-col items-start space-y-4 p-6">
        {icon}
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </SpecialCardContent>
    </SpecialCard>
  );
}

export default Feature;
