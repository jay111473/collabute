import React from "react";
import { Card, CardContent } from "../../ui/card";
import { Rocket, Sparkles, DollarSign, Diamond } from "lucide-react";
import AIBadge from "@/components/uikit/ai-badge";

const Feature = () => {
  return (
    <section className="w-full">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <AIBadge text="Smart solution" />
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            <span className="text-purple-400">Your Technical Arm </span> in
            Action
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Rocket className="h-8 w-8 text-purple-400" />}
            title="Speed to Market"
            description="Launch your ideas faster with immediate access to top developers."
          />
          <FeatureCard
            icon={<Sparkles className="h-8 w-8 text-purple-400" />}
            title="AI-Powered Project Management Tools"
            description="Streamline project management and enhance collaboration."
          />
          <FeatureCard
            icon={<DollarSign className="h-8 w-8 text-purple-400" />}
            title="Fair Compensation"
            description="Developers earn based on their contributions, ensuring transparency and motivation."
          />
          <FeatureCard
            icon={<Diamond className="h-8 w-8 text-purple-400" />}
            title="Flexible Talent Pool"
            description="Access the right talent for every project, from juniors to senior experts."
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
    <Card className="relative overflow-hidden rounded-[20px] border border-purple-500/20 bg-[#09090b] bg-gradient-to-b from-purple-500/5 to-transparent backdrop-blur-sm transition-all hover:border-purple-500/40">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -inset-x-20 -inset-y-40 from-purple-500/20 via-transparent to-transparent bg-gradient-to-r rotate-12 transform scale-y-[2] group-hover:animate-shine" />
      <CardContent className="relative flex flex-col items-start space-y-4 p-6">
        {icon}
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </CardContent>
    </Card>
  );
}

export default Feature;
