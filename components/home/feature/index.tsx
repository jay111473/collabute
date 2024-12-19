import React from "react";
import { Card, CardContent } from "../../ui/card";
import { Rocket, Sparkles, DollarSign, Diamond } from "lucide-react";

const Feature = () => {
  return (
    <section className="w-full">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="relative mb-4">
            <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-[calc(100%-2px)] h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            
            <div className="relative inline-flex items-center gap-2 px-3 py-2 rounded-full border border-white/20">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-white">
                Smart solution
              </span>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="text-purple-400">Why</span> Choose Collabute?
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
    <Card className="group relative overflow-hidden rounded-[20px] border border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-transparent backdrop-blur-sm transition-all hover:border-purple-500/40">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -inset-x-20 -inset-y-40 from-purple-500/20 via-transparent to-transparent bg-gradient-to-r rotate-12 transform scale-y-[2] group-hover:animate-shine" />
      <CardContent className="relative flex flex-col items-start space-y-4 p-6">
        <div className="rounded-full p-2.5 bg-purple-500/10 backdrop-blur-md border border-purple-500/20">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </CardContent>
    </Card>
  );
}

export default Feature;
