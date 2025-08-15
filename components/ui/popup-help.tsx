"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ExternalLink } from "lucide-react";

interface PopupHelpProps {
  onClose: () => void;
  onUseRedirect: () => void;
}

export const PopupHelp = ({ onClose, onUseRedirect }: PopupHelpProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const chromeSteps = [
    "Look for a popup blocked icon in your address bar (usually on the right)",
    "Click the popup blocked icon",
    "Select 'Always allow popups from this site'",
    "Click 'Done' and try connecting again"
  ];

  const firefoxSteps = [
    "Look for a popup blocked notification in the address bar",
    "Click 'Options' or the popup blocked icon",
    "Select 'Allow popups for this site'",
    "Refresh the page and try again"
  ];

  const safariSteps = [
    "Go to Safari → Preferences → Websites",
    "Click 'Pop-up Windows' in the left sidebar",
    "Find this website and set it to 'Allow'",
    "Refresh the page and try again"
  ];

  const getBrowserSteps = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome') && !userAgent.includes('edge')) {
      return { browser: 'Chrome', steps: chromeSteps };
    } else if (userAgent.includes('firefox')) {
      return { browser: 'Firefox', steps: firefoxSteps };
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return { browser: 'Safari', steps: safariSteps };
    } else {
      return { browser: 'Chrome', steps: chromeSteps }; // Default to Chrome
    }
  };

  const { browser, steps } = getBrowserSteps();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-grayBorders rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Enable Popups</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-300 text-sm">
            To use popup authentication, please allow popups for this site in {browser}:
          </p>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-md transition-colors ${
                  index === currentStep ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-gray-800/50'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  index === currentStep ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
                }`}>
                  {index + 1}
                </div>
                <p className="text-sm text-gray-300 flex-1">{step}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button
              onClick={() => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))}
              disabled={currentStep >= steps.length - 1}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {currentStep >= steps.length - 1 ? 'All Done!' : 'Next Step'}
            </Button>
          </div>

          <div className="pt-4 border-t border-grayBorders">
            <p className="text-gray-400 text-xs mb-3">
              Having trouble? You can use redirect authentication instead:
            </p>
            <Button
              onClick={onUseRedirect}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Use Redirect Instead
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};