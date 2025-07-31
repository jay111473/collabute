"use client";

import AIBadge from "@/components/uikit/ai-badge";
import { PricingButton } from "@/components/uikit/pricing-button";
import { TooltipProvider } from "@/components/ui/tooltip";
import React, { useState } from "react";

const PricingComponent = () => {
  const [selectedPlan, setSelectedPlan] = useState<"startup" | "developer">(
    "startup"
  );

  const startupPlans = [
    {
      name: "Startup Free Plan",
      price: "Free",
      period: "",
      isPopular: false,
      originalPrice: undefined,
      features: [
        "Production Management",
        "AI Accelerated Idea Refinement",
        "Project Platform Breakdown",
        "Platform Agnostic Tasks/Features",
        "Project Milestone Breakdown",
        "Explore Paid Team Lead",
        "Chat Communication",
        "Create 1 Product",
        "Autonomous Code Documentation (20 features)",
      ],
    },
    {
      name: "Startup Pro plan",
      price: "$29.99",
      period: "/ Month",
      originalPrice: "$39.99",
      isPopular: true,
      features: [
        "SWOT analysis",
        "Competitor analysis",
        "Equity Stakeholders",
        "AI Meeting Manager",
        "Analytics Dashboard Integration",
        "Create up to 3 Products",
        "Autonomous Code Documentation (Unlimited)",
        "Featured Projects (up to 5/months)",
        "Access to Community",
        "Free Contribution Access",
        "Talent Smart Matching",
      ],
    },
  ];

  const developerPlans = [
    {
      name: "Developer Free Plan",
      price: "Free",
      period: "",
      isPopular: false,
      originalPrice: undefined,
      features: [
        "20 Application/Month",
        "3-Day Payment Grace Period",
        "Invite up 5 contributors",
        "Featured up to 2 application/months",
        "ACH Bank Transfers Withdrawal Method",
        "AI Code Review (Limited Version)",
        "Earning Dashboard Analytics",
      ],
    },
    {
      name: "Developer Pro plan",
      price: "$19.99",
      period: "/ Month",
      originalPrice: "$29.99",
      isPopular: true,
      features: [
        "150 Application/Month",
        "AI Code Review (Unlimited)",
        "Earning Advance Insights and Suggestions",
        "ACH Bank Transfers/Cryptocurrency/payoneer Withdrawal Method",
        "Invite up 20 contributors",
        "Apply to become a team lead possibility",
        "Automated Testing Integration",
        "Code Quality Metrics",
        "Instant Payment Withdrawal",
        "2% collabute fee deduction on payments",
      ],
    },
  ];

  const currentPlans =
    selectedPlan === "startup" ? startupPlans : developerPlans;

  return (
    <TooltipProvider>
      <div className="w-full mt-24 space-y-16 py-16">
        {/* Hero Section */}
        <section className="w-full relative">
          <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Choose Your <span className="text-white/80">Path</span>
            </h1>
            <p className="text-gray-400 text-xl leading-relaxed max-w-3xl">
              Your skills deserve recognition and fair compensation. Collabute
              integrates seamlessly with GitHub, allowing you to contribute
              effectively and earn based on your contributions.
            </p>
          </div>
        </section>

        {/* Toggle Section */}
        <section className="w-full relative">
          <div className="container px-4 md:px-6 flex flex-col items-center">
            <div className="bg-darkGray/50 backdrop-blur-sm border border-white/10 rounded-xl p-2 mb-16">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedPlan("startup")}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedPlan === "startup"
                      ? "bg-darkPrimary text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  For Startups
                </button>
                <button
                  onClick={() => setSelectedPlan("developer")}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedPlan === "developer"
                      ? "bg-darkPrimary text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  For Developers
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full items-stretch">
              {currentPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative backdrop-blur-sm border rounded-2xl h-full ${
                    plan.isPopular
                      ? "border-white/30 bg-gradient-to-br from-darkPrimary/15 via-darkGray/50 to-darkGray/60"
                      : "border-white/10 bg-darkGray/50"
                  }`}
                >
                  <div className="p-8 h-full flex flex-col">
                    {/* Plan Header */}
                    <div className="space-y-6 mb-12">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-white mb-4">
                          {plan.name}
                        </h3>
                        <div className="space-y-2">
                          <div className="text-gray-500 line-through text-sm h-5">
                            {plan.originalPrice || ""}
                          </div>
                          <div className="flex items-baseline justify-center space-x-1">
                            <span className="text-4xl font-bold text-white">
                              {plan.price}
                            </span>
                            {plan.period && (
                              <span className="text-gray-400 text-sm">
                                {plan.period}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-5 flex-grow">
                      {plan.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-start space-x-4 group"
                        >
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-darkPrimary/20 flex items-center justify-center mt-0.5">
                            <svg 
                              className="w-3 h-3 text-darkPrimary" 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path 
                                fillRule="evenodd" 
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                                clipRule="evenodd" 
                              />
                            </svg>
                          </div>
                          <span className="text-gray-200 text-sm font-medium leading-relaxed group-hover:text-white transition-colors duration-200">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <div className="pt-8 mt-auto">
                      <PricingButton
                        variant={
                          plan.price === "Free" ? "secondary" : "darkPrimary"
                        }
                        disabled={true}
                        tooltipText="You can get access to subscriptions once you login"
                      >
                        {plan.price === "Free"
                          ? "Go with Free"
                          : plan.name.includes("Startup")
                            ? "Go with Startup Pro"
                            : "Go with Developer Pro"}
                      </PricingButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full relative">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-12">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <AIBadge text="FAQ" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Frequently Asked{" "}
                  <span className="text-white/80">Questions</span>
                </h2>
              </div>

              <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-darkGray/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-left">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Can I switch between plans?
                  </h3>
                  <p className="text-gray-300">
                    Yes, you can upgrade or downgrade your plan at any time.
                    Changes will be reflected in your next billing cycle.
                  </p>
                </div>

                <div className="bg-darkGray/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-left">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    What&apos;s included in the Free plan?
                  </h3>
                  <p className="text-gray-300">
                    The Free plan includes all essential features to get started
                    with your first product, including AI-powered project planning
                    and basic code documentation.
                  </p>
                </div>

                <div className="bg-darkGray/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-left">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    When will Developer plans be available?
                  </h3>
                  <p className="text-gray-300">
                    Developer-specific plans are coming soon. Join our community
                    to be notified when they become available.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
};

export default PricingComponent;
