"use client";

import { motion } from "framer-motion";

export function WizardVideoPreview() {
  return (
    <div className="relative rounded-xl overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="aspect-video bg-black/50 rounded-xl relative flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-darkPrimary/20 to-transparent rounded-xl" />
        <div className="text-center z-10 space-y-4 p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            How the Wizard Works
          </h3>
          <p className="text-gray-300 max-w-md mx-auto">
            This project wizard will guide you through 7 simple steps to define your project, 
            analyze competitors, plan features, and build your development team.
          </p>
          <div className="mx-auto w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
