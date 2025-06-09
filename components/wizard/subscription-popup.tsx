"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Crown,
  Zap,
  Users,
  Calendar,
  CheckCircle,
  Sparkles,
  ArrowRight,
  X,
  Rocket,
  Shield,
  Clock,
} from "lucide-react";

interface SubscriptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (plan: "pro" | "enterprise") => void;
  onContinueLimited: () => void;
}

const features = {
  limited: [
    "Basic project timeline",
    "Up to 3 team members",
    "Standard templates",
    "Email support",
  ],
  pro: [
    "Advanced project analytics",
    "Unlimited team members",
    "Custom templates & workflows",
    "Priority support",
    "AI-powered insights",
    "Advanced collaboration tools",
    "Export to multiple formats",
    "Integration with 50+ tools",
  ],
  enterprise: [
    "Everything in Pro",
    "Custom AI training",
    "Dedicated account manager",
    "Advanced security & compliance",
    "Custom integrations",
    "White-label solutions",
    "24/7 phone support",
    "SLA guarantees",
  ],
};

export function SubscriptionPopup({
  isOpen,
  onClose,
  onSubscribe,
  onContinueLimited,
}: SubscriptionPopupProps) {
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "enterprise">("pro");

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl p-0 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/50 overflow-hidden">
            <div className="relative">
              {/* Subtle Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/20 via-transparent to-zinc-800/20" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary2/5 rounded-full blur-2xl" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-zinc-800/30 hover:bg-zinc-700/50 transition-colors"
              >
                <X className="h-4 w-4 text-zinc-400 hover:text-white" />
              </button>

              <div className="relative p-6">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-6"
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-primary2/20 to-darkPrimary/20 border border-primary2/20">
                      <Sparkles className="h-5 w-5 text-primary2" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-2">
                    Choose Your Plan
                  </h2>
                  <p className="text-sm text-zinc-400 max-w-lg mx-auto">
                    Continue with limited features or unlock the full potential of your project management.
                  </p>
                </motion.div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {/* Limited Plan */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all duration-300"
                  >
                    <div className="text-center mb-4">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="h-5 w-5 text-zinc-500" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-1">Continue Limited</h3>
                      <p className="text-zinc-500 text-xs">Basic features to get started</p>
                      <div className="mt-2">
                        <span className="text-xl font-semibold text-white">Free</span>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-4">
                      {features.limited.map((feature, index) => (
                        <li key={index} className="flex items-center text-xs text-zinc-400">
                          <CheckCircle className="h-3 w-3 text-zinc-600 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={onContinueLimited}
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
                    >
                      Continue with Limited
                    </Button>
                  </motion.div>

                  {/* Pro Plan */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative p-4 rounded-xl border border-primary2/30 bg-gradient-to-br from-primary2/5 to-darkPrimary/5 transition-all duration-300 hover:border-primary2/50"
                  >
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary2 text-white text-xs px-2 py-0.5">
                      Recommended
                    </Badge>

                    <div className="text-center mb-4">
                      <div className="flex items-center justify-center mb-2">
                        <Zap className="h-5 w-5 text-primary2" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-1">Pro Plan</h3>
                      <p className="text-zinc-400 text-xs">Perfect for growing teams</p>
                      <div className="mt-2">
                        <span className="text-xl font-semibold text-white">$49</span>
                        <span className="text-zinc-400 text-sm">/month</span>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-4">
                      {features.pro.slice(0, 4).map((feature, index) => (
                        <li key={index} className="flex items-center text-xs text-zinc-300">
                          <CheckCircle className="h-3 w-3 text-primary2 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                      <li className="text-xs text-zinc-500 pl-5">+4 more features</li>
                    </ul>

                    <Button
                      onClick={() => onSubscribe("pro")}
                      size="sm"
                      className="w-full bg-primary2 hover:bg-primary2/90 text-white"
                    >
                      <Rocket className="h-3 w-3 mr-1" />
                      Start Pro Trial
                    </Button>
                  </motion.div>

                  {/* Enterprise Plan */}
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all duration-300"
                  >
                    <div className="text-center mb-4">
                      <div className="flex items-center justify-center mb-2">
                        <Crown className="h-5 w-5 text-amber-500" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-1">Enterprise</h3>
                      <p className="text-zinc-500 text-xs">For large organizations</p>
                      <div className="mt-2">
                        <span className="text-xl font-semibold text-white">Custom</span>
                        <span className="text-zinc-400 text-sm"> pricing</span>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-4">
                      {features.enterprise.slice(0, 4).map((feature, index) => (
                        <li key={index} className="flex items-center text-xs text-zinc-400">
                          <CheckCircle className="h-3 w-3 text-amber-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                      <li className="text-xs text-zinc-500 pl-5">+4 more features</li>
                    </ul>

                    <Button
                      onClick={() => onSubscribe("enterprise")}
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Contact Sales
                    </Button>
                  </motion.div>
                </div>

                {/* Bottom CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <p className="text-zinc-500 mb-3 text-sm">
                    🎉 <strong className="text-zinc-300">Limited Time:</strong> Get 30% off your first 3 months
                  </p>
                  <div className="flex items-center justify-center gap-6 text-xs text-zinc-600">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      30-day guarantee
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Cancel anytime
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      No setup fees
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
} 