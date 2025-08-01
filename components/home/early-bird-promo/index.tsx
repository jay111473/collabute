"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CosmicButton } from "@/components/uikit/cosmic-button";
import AIBadge from "@/components/uikit/ai-badge";
import { motion } from "framer-motion";

const EarlyBirdPromo = () => {
  return (
    <section className="w-full relative">
      <div className="container px-4 md:px-6">
        <motion.div
          className="bg-darkGray/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-center">
              <AIBadge text="Early Access" />
            </div>

            <h2 className="text-2xl md:text-4xl font-bold text-white">
              We&apos;re rolling out Collabute to{" "}
              <span className="text-purple-400">Early Bird</span> users
            </h2>

            <p className="text-gray-300 text-lg leading-relaxed">
              Be among the first to experience the future of collaboration. Join
              our exclusive early bird program and get priority access to
              connect with top developers and innovative projects.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <CosmicButton>
                <Link href="/early-bird">Register for Early Bird</Link>
              </CosmicButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EarlyBirdPromo;
