"use client";

import { Switch } from "@/components/ui/switch";
import { useFloatingNav } from "@/lib/hooks/use-floating-nav";
import { Monitor, Smartphone } from "lucide-react";

export default function PreferencesSettings() {
  const { isFloatingNavEnabled, toggleFloatingNav } = useFloatingNav();

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-xl text-white">Preferences</h2>

      <div className="space-y-6">
        {/* Navigation Style Setting */}
        <div className="flex items-center justify-between p-4 border border-grayBorders rounded-lg bg-transparent">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-darkGray rounded-lg">
              <Monitor className="h-5 w-5 text-primary2" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-white font-medium">Navigation Style</h3>
              <p className="text-gray-400 text-sm">
                Choose between traditional sidebar or floating bottom navigation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {isFloatingNavEnabled ? "Floating" : "Sidebar"}
            </span>
            <Switch
              checked={isFloatingNavEnabled}
              onCheckedChange={toggleFloatingNav}
              className="data-[state=checked]:bg-primary2"
            />
          </div>
        </div>

        {/* Navigation Preview */}
        <div className="p-4 border border-grayBorders rounded-lg bg-transparent">
          <h4 className="text-white font-medium mb-3">Preview</h4>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {isFloatingNavEnabled ? (
              <>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-primary2" />
                  <span>Floating bottom bar with glassmorphism design</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-primary2" />
                  <span>Traditional sidebar navigation</span>
                </div>
              </>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Changes take effect immediately. Refresh the page if needed.
          </p>
        </div>
      </div>
    </div>
  );
} 