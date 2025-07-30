"use client";

import AIBadge from "@/components/uikit/ai-badge";
import Image from "next/image";
import React from "react";

const SolutionsComponent = () => {
  return (
    <div className="w-full mt-24 px-24">
      {/* Hero Section - Full Screen Split */}
      <section className="w-full min-h-[50vh] relative flex items-center">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 items-center min-h-[80vh]">
            <div className="lg:col-span-7 space-y-8">
              <AIBadge text="Our Solutions" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Two Paths,
                <br />
                <span className="text-darkPrimary">One Platform</span>
              </h1>
              <p className="text-gray-400 text-xl leading-relaxed max-w-2xl">
                Whether you&apos;re building the next big thing or coding it
                into reality, we&apos;ve designed the perfect space for your
                journey.
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className="relative h-[500px] lg:h-[600px]">
                <Image
                  src="/s1.png"
                  alt="Solutions overview illustration"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Founders Section - Diagonal Layout */}
      <section className="w-full relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-darkPrimary/5 to-transparent transform -skew-y-1"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-3 gap-16 items-start">
            {/* Founders Badge and Title */}
            <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-32">
              <AIBadge text="For Founders" />
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Your Vision,
                <br />
                <span className="text-darkPrimary">Simplified</span>
              </h2>
            </div>

            {/* Content Cards */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 transform hover:scale-105 transition-transform duration-300">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Articulate & Refine
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Simply describe your concept. Our AI helps refine your vision
                  into actionable requirements, eliminating guesswork and
                  miscommunication.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 transform hover:scale-105 transition-transform duration-300 ml-8">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Select & Launch
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Choose your platforms—web, mobile, or both. Experienced team
                  leads and developers take over, bringing your vision to life
                  with precision.
                </p>
              </div>

              <div className="bg-gradient-to-r from-darkPrimary/20 to-darkPrimary/10 backdrop-blur-sm border border-darkPrimary/30 rounded-2xl p-8 transform hover:scale-105 transition-transform duration-300">
                <h3 className="text-xl font-semibold text-white mb-4">
                  One Environment, Everything Managed
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  No more juggling apps. Payments, progress tracking, team
                  communication—all seamlessly integrated in one cohesive
                  workspace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Developers Section - Asymmetric Layout */}
      <section className="w-full relative py-32">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-5 gap-16 items-center">
            {/* Left - Large Image */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="relative h-[600px] rounded-3xl overflow-hidden">
                <Image
                  src="/s2.png"
                  alt="Developer workflow illustration"
                  fill
                  className="object-contain p-8"
                />
              </div>
            </div>

            {/* Right - Content */}
            <div className="lg:col-span-3 order-1 lg:order-2 space-y-12">
              <div className="space-y-6">
                <AIBadge text="For Developers" />
                <h2 className="text-4xl md:text-5xl font-bold text-white">
                  Code with
                  <br />
                  <span className="text-darkPrimary">Impact</span>
                </h2>
              </div>

              {/* Feature List - Vertical Timeline Style */}
              <div className="space-y-8 relative">
                <div className="absolute left-4 top-4 bottom-4 w-px bg-gradient-to-b from-darkPrimary via-darkPrimary/50 to-transparent"></div>

                <div className="flex items-start space-x-6 relative">
                  <div className="w-8 h-8 bg-darkPrimary rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">
                      Meaningful Projects
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Skip the endless freelance searches. Find work that
                      genuinely matters—projects you&apos;ll be proud to
                      showcase.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-6 relative">
                  <div className="w-8 h-8 bg-darkPrimary rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">
                      Instant Rewards
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Payment arrives the moment your code gets approved. No
                      waiting, no chasing invoices, no payment delays.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-6 relative">
                  <div className="w-8 h-8 bg-darkPrimary rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">
                      True Autonomy
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Build with purpose, work on your terms, get compensated
                      fairly—all within one integrated ecosystem.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Centered Circle Layout */}
    </div>
  );
};

export default SolutionsComponent;
