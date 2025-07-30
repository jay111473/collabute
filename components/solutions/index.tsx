"use client";

import AIBadge from "@/components/uikit/ai-badge";
import Image from "next/image";
import React from "react";

const SolutionsComponent = () => {
  return (
    <div className="w-full mt-16 sm:mt-20 md:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 bg-background">
      {/* Hero Section - Full Screen Split */}
      <section className="w-full min-h-[60vh] sm:min-h-[50vh] relative flex items-center">
        <div className="container px-0 relative z-10">
          <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 items-center min-h-[60vh] sm:min-h-[70vh] lg:min-h-[80vh]">
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              <AIBadge text="Our Solutions" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Two Paths,
                <br />
                <span className="text-darkPrimary">One Platform</span>
              </h1>
              <p className="text-gray-400 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl">
                Whether you&apos;re building the next big thing or coding it
                into reality, we&apos;ve designed the perfect space for your
                journey.
              </p>
            </div>
            <div className="lg:col-span-5 order-first lg:order-last">
              <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]">
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
      <section className="w-full relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden1">
        <div className="absolute transform -skew-y-1"></div>
        <div className="container px-0 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16 items-start">
            {/* Founders Badge and Title */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6 lg:sticky lg:top-32">
              <AIBadge text="For Founders" />
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                Your Vision,
                <br />
                <span className="text-darkPrimary">Simplified</span>
              </h2>
            </div>

            {/* Content Cards */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 transform hover:scale-105 transition-transform duration-300">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                  Articulate & Refine
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                  Simply describe your concept. Our AI helps refine your vision
                  into actionable requirements, eliminating guesswork and
                  miscommunication.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 transform hover:scale-105 transition-transform duration-300 lg:ml-8">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                  Select & Launch
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                  Choose your platforms—web, mobile, or both. Experienced team
                  leads and developers take over, bringing your vision to life
                  with precision.
                </p>
              </div>

              <div className="bg-gradient-to-r from-darkPrimary/20 to-darkPrimary/10 backdrop-blur-sm border border-darkPrimary/30 rounded-xl sm:rounded-2xl p-6 sm:p-8 transform hover:scale-105 transition-transform duration-300">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                  One Environment, Everything Managed
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
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
      <section className="w-full relative py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="container px-0">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left - Large Image */}
            <div className="hidden lg:block lg:col-span-2 order-2 lg:order-1">
              <div className="relative h-[400px] sm:h-[500px] md:h-[600px] rounded-2xl sm:rounded-3xl overflow-hidden">
                <Image
                  src="/s2.png"
                  alt="Developer workflow illustration"
                  fill
                  className="object-contain p-4 sm:p-6 md:p-8"
                />
              </div>
            </div>

            {/* Right - Content */}
            <div className="col-span-1 lg:col-span-3 order-1 lg:order-2 space-y-8 sm:space-y-12">
              <div className="space-y-4 sm:space-y-6">
                <AIBadge text="For Developers" />
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                  Code with
                  <br />
                  <span className="text-darkPrimary">Impact</span>
                </h2>
              </div>

              {/* Feature List - Vertical Timeline Style */}
              <div className="space-y-6 sm:space-y-8 relative">
                <div className="absolute left-4 top-4 bottom-4 w-px bg-gradient-to-b from-darkPrimary via-darkPrimary/50 to-transparent"></div>

                <div className="flex items-start space-x-4 sm:space-x-6 relative">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-darkPrimary rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">
                      Meaningful Projects
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                      Skip the endless freelance searches. Find work that
                      genuinely matters—projects you&apos;ll be proud to
                      showcase.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 sm:space-x-6 relative">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-darkPrimary rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">
                      Instant Rewards
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                      Payment arrives the moment your code gets approved. No
                      waiting, no chasing invoices, no payment delays.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 sm:space-x-6 relative">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-darkPrimary rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">
                      True Autonomy
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
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
      <section className="w-full relative py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="container px-0">
          <div className="text-center space-y-6 sm:space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Ready to Get Started?
            </h2>
            <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto">
              Join thousands of founders and developers building the future together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <button className="bg-darkPrimary hover:bg-darkPrimary/90 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-lg font-semibold transition-colors duration-200">
                Start Your Project
              </button>
              <button className="border border-white/20 hover:border-white/40 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-lg font-semibold transition-colors duration-200">
                Join as Developer
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SolutionsComponent;
