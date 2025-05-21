"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ProjectDefinitionConfirmationProps {
  initialName: string;
  initialDescription: string;
  onConfirm: (data: { name: string; description: string }) => void;
  isLoadingExternally?: boolean; // To show loading from parent
}

export function ProjectDefinitionConfirmation({
  initialName,
  initialDescription,
  onConfirm,
  isLoadingExternally,
}: ProjectDefinitionConfirmationProps) {
  const [projectName, setProjectName] = useState(initialName);
  const [projectDescription, setProjectDescription] =
    useState(initialDescription);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setProjectName(initialName);
    setProjectDescription(initialDescription);
  }, [initialName, initialDescription]);

  const handleConfirm = () => {
    setIsProcessing(true);
    // Simulate a short delay if needed, or parent can handle loading state
    onConfirm({ name: projectName, description: projectDescription });
    // Parent should handle unsetting isProcessing or isLoadingExternally
  };

  const isConfirmDisabled =
    !projectName.trim() || !projectDescription.trim() || isProcessing || isLoadingExternally;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto space-y-8 py-8"
    >
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-white">Confirm Project Details</h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Our AI has generated a name and description for your project based on
          its files. Please review and edit if necessary.
        </p>
      </div>

      <div className="space-y-6 bg-darkPrimary/5 border border-white/10 p-8 rounded-2xl shadow-xl">
        <div>
          <label
            htmlFor="projectName"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Project Name
          </label>
          <Input
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g., My Awesome App"
            className="bg-darkPrimary/10 border-gray-700 text-white focus:ring-primary focus:border-primary"
            disabled={isProcessing || isLoadingExternally}
          />
        </div>

        <div>
          <label
            htmlFor="projectDescription"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Project Description
          </label>
          <Textarea
            id="projectDescription"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Describe your project in a few sentences..."
            rows={5}
            className="bg-darkPrimary/10 border-gray-700 text-white focus:ring-primary focus:border-primary min-h-[120px]"
            disabled={isProcessing || isLoadingExternally}
          />
        </div>

        <Button
          onClick={handleConfirm}
          disabled={isConfirmDisabled}
          className="w-full dark:bg-darkPrimary hover:dark:bg-darkPrimary/90 dark:text-black text-black rounded-lg py-3 text-base"
        >
          {isProcessing || isLoadingExternally ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Confirm and Continue"
          )}
        </Button>
      </div>
    </motion.div>
  );
} 