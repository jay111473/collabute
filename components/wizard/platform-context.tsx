import { motion } from "framer-motion";
import { 
  Rocket, 
  Users, 
  Code, 
  CheckCircle, 
  ArrowRight, 
  Zap,
  Target,
  Globe,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformContextProps {
  className?: string;
}

export function PlatformContext({ className }: PlatformContextProps) {
  const features = [
    {
      icon: Target,
      title: "AI-Powered Planning",
      description: "Transform your idea into detailed project specifications with competitive analysis"
    },
    {
      icon: Users,
      title: "Expert Developer Network",
      description: "Access vetted developers specialized in your technology stack"
    },
    {
      icon: Code,
      title: "Quality Assurance",
      description: "Technical Product Managers ensure code quality and project delivery"
    },
    {
      icon: Rocket,
      title: "Marketplace Launch",
      description: "Your project goes live where developers can bid and contribute"
    }
  ];

  const journey = [
    { step: "Share Vision", description: "Tell us your idea" },
    { step: "AI Analysis", description: "Market & competitor research" },
    { step: "Project Planning", description: "Technical roadmap creation" },
    { step: "Team Assembly", description: "Expert developer matching" },
    { step: "Development", description: "Collaborative building" },
    { step: "Launch", description: "Product delivery" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "bg-gradient-to-br from-zinc-900/95 to-zinc-800/95 rounded-2xl p-8 border border-zinc-700/50 backdrop-blur-sm",
        className
      )}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary2/20 to-darkPrimary/20 flex items-center justify-center border border-primary2/30">
            <Globe className="w-6 h-6 text-primary2" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            Welcome to Collabute
          </h2>
        </div>
        <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
          The AI-powered platform that transforms your ideas into reality through expert developer collaboration
        </p>
      </div>

      {/* How It Works */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary2" />
          How Collabute Works
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary2/20 to-darkPrimary/20 flex items-center justify-center border border-primary2/30 flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary2" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Your Journey */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Star className="w-5 h-5 text-primary2" />
          Your Journey to Success
        </h3>
        
        <div className="space-y-3">
          {journey.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary2/20 to-darkPrimary/20 flex items-center justify-center border border-primary2/30 flex-shrink-0">
                <span className="text-xs font-bold text-primary2">{index + 1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{item.step}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-400">{item.description}</span>
                </div>
              </div>
              {index < journey.length - 1 && (
                <ArrowRight className="w-4 h-4 text-zinc-600" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center pt-6 border-t border-zinc-700/50">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>This wizard will guide you through the first 3 steps</span>
        </div>
      </div>
    </motion.div>
  );
} 