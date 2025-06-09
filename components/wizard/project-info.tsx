import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  Loader2,
  CheckCircle,
  MessageCircle,
  Plus,
  Lightbulb,
  HelpCircle,
  Info,
} from "lucide-react";
import { Industry, type ProjectInfo } from "@/types/wizard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectInfoProps {
  onProjectInfoChange: (info: ProjectInfo) => void;
  onNext?: () => void;
  canProceed?: boolean;
  isLoading?: boolean;
  suggestedIndustries: Industry[];
}

interface ConversationMessage {
  role: "user" | "ai";
  content: string;
  timestamp: number;
}

interface AIResponse {
  needsMoreInfo: boolean;
  followUpQuestion?: string;
  refinedIdea?: string;
  readyToProceed: boolean;
  reasoning: string;
  suggestions?: Array<{
    text: string;
    description: string;
  }>;
}

interface SuggestionBadge {
  text: string;
  description: string;
  isSelected: boolean;
}

export function ProjectInfo({
  onProjectInfoChange,
  onNext,
  canProceed = false,
  isLoading: externalLoading = false,
  suggestedIndustries,
}: ProjectInfoProps) {
  const [idea, setIdea] = useState("");
  const [originalIdea, setOriginalIdea] = useState("");
  const [currentInput, setCurrentInput] = useState("");
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConversationMode, setIsConversationMode] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionBadge[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(
    new Set()
  );
  const [hasNoIdea, setHasNoIdea] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleIdeaChange = (value: string) => {
    if (!isConversationMode) {
      setIdea(value);
      setCurrentInput(value);
    } else {
      setCurrentInput(value);
    }
  };

  const checkForNoIdea = (text: string) => {
    const lowerText = text.toLowerCase();
    return lowerText.includes("i have no idea") || 
           lowerText.includes("no idea") || 
           lowerText.includes("don't know") ||
           lowerText.includes("not sure");
  };

  const toggleSuggestion = (suggestion: SuggestionBadge) => {
    const newSelected = new Set(selectedSuggestions);

    if (newSelected.has(suggestion.text)) {
      newSelected.delete(suggestion.text);
      const newInput = currentInput
        .replace(new RegExp(`\\s*${suggestion.text}\\s*`, "g"), " ")
        .trim();
      setCurrentInput(newInput);
    } else {
      newSelected.add(suggestion.text);
      const newInput = currentInput
        ? `${currentInput} ${suggestion.text}`
        : suggestion.text;
      setCurrentInput(newInput);
    }

    setSelectedSuggestions(newSelected);

    setSuggestions((prev) =>
      prev.map((s) => ({
        ...s,
        isSelected: s.text === suggestion.text ? !s.isSelected : s.isSelected,
      }))
    );

    if (suggestion.text === "I have no idea" && newSelected.has(suggestion.text)) {
      setHasNoIdea(true);
    }
  };

  const validateWithAI = async (userInput: string) => {
    setIsProcessing(true);

    if (!isConversationMode && !originalIdea) {
      setOriginalIdea(userInput);
      console.log("Storing original idea:", userInput);
    }

    const userHasNoIdea = checkForNoIdea(userInput);
    if (userHasNoIdea) {
      setHasNoIdea(true);
    }

    try {
      const response = await fetch("/api/wizard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea: isConversationMode ? idea : userInput,
          conversation: isConversationMode
            ? [
                ...conversation,
                { role: "user", content: userInput, timestamp: Date.now() },
              ]
            : [],
          hasNoIdea: userHasNoIdea || hasNoIdea,
        }),
      });

      const data: AIResponse = await response.json();

      if (data.needsMoreInfo && data.followUpQuestion) {
        const newConversation = [
          ...conversation,
          { role: "user" as const, content: userInput, timestamp: Date.now() },
          {
            role: "ai" as const,
            content: data.followUpQuestion,
            timestamp: Date.now() + 1,
          },
        ];

        setConversation(newConversation);
        setIsConversationMode(true);
        setCurrentInput("");
        setSelectedSuggestions(new Set());

        const allSuggestions = [
          {
            text: "I have no idea",
            description:
              "Let our AI guide you through building your system step by step",
            isSelected: false,
          },
          ...(data.suggestions || []).map((s) => ({
            text: s.text,
            description: s.description,
            isSelected: false,
          })),
        ];

        setSuggestions(allSuggestions);

        if (!isConversationMode) {
          setIdea(userInput);
        }
      } else {
        const finalIdea = data.refinedIdea || userInput || "User needs guidance with idea development";
        setIdea(finalIdea);
        setIsApproved(true);

        const finalMessage = userHasNoIdea || hasNoIdea 
          ? `Excellent work! 🎉 We've helped you discover a fantastic project idea: "${finalIdea}". Now let's turn this into reality with a complete project plan!`
          : `Perfect! Your idea is clear and ready for project planning. Let's move forward with: "${finalIdea}"`;

        const finalConversation = [
          ...conversation,
          { role: "user" as const, content: userInput, timestamp: Date.now() },
          {
            role: "ai" as const,
            content: finalMessage,
            timestamp: Date.now() + 1,
          },
        ];
        setConversation(finalConversation);

        const ideaToUse = originalIdea || finalIdea;
        console.log("Final idea for next steps:", ideaToUse, "Original:", originalIdea, "Final:", finalIdea);

        onProjectInfoChange({
          idea: ideaToUse,
          originalIdea: originalIdea,
          name: "",
          description: "",
          industries: [],
          projectPlatforms: [],
        });

        setTimeout(() => {
          if (onNext) onNext();
        }, 2000);
      }
    } catch (error) {
      console.error("Error validating idea:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    const inputToSubmit = currentInput.trim();
    if (!inputToSubmit || isProcessing) return;

    validateWithAI(inputToSubmit);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = currentInput.trim().length > 0 && !isProcessing;

  return (
    <TooltipProvider>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <style jsx>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(123, 97, 255, 0.3) transparent;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(123, 97, 255, 0.3);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(123, 97, 255, 0.5);
          }
        `}</style>

        <div className="w-full max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {!isConversationMode ? (
              <motion.div
                key="initial"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="text-center space-y-8"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-4"
                >
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-primary2 to-darkPrimary bg-clip-text text-transparent pb-4">
                    Bring your idea to life
                  </h1>
                  <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto p-0">
                    Describe your vision and let AI help you build something
                    amazing
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative max-w-3xl mx-auto"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary2/20 to-darkPrimary/20 rounded-2xl blur-xl opacity-50" />

                    <div className="relative z-10">
                      <Textarea
                        value={currentInput}
                        onChange={(e) => handleIdeaChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="What is your idea?"
                        className={cn(
                          "min-h-[120px] md:min-h-[150px] md:text-sm p-6 md:p-8 pr-16",
                          "bg-black/40 backdrop-blur-sm border-2 border-white/10",
                          "rounded-xl resize-none",
                          "text-white placeholder:text-gray-500",
                          "hover:border-white/20 transition-all duration-300",
                          "shadow-[0_0_30px_rgba(123,97,255,0.1)]",
                          "focus:border-white/10 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                          "focus:shadow-[0_0_40px_rgba(123,97,255,0.2)]"
                        )}
                        disabled={isProcessing}
                        maxLength={500}
                      />

                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                          opacity: canSubmit ? 1 : 0.3,
                          scale: canSubmit ? 1 : 0.8,
                        }}
                        whileHover={{ scale: canSubmit ? 1.05 : 0.8 }}
                        whileTap={{ scale: canSubmit ? 0.95 : 0.8 }}
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className={cn(
                          "absolute bottom-4 right-4 w-10 h-10 rounded-full",
                          "flex items-center justify-center",
                          "bg-gradient-to-r from-primary2 to-darkPrimary",
                          "shadow-[0_0_15px_rgba(123,97,255,0.4)]",
                          "transition-all duration-300",
                          canSubmit
                            ? "hover:shadow-[0_0_25px_rgba(123,97,255,0.6)] cursor-pointer"
                            : "cursor-not-allowed"
                        )}
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 text-white animate-spin" />
                        ) : (
                          <ArrowUp className="h-4 w-4 text-white" />
                        )}
                      </motion.button>

                      <div className="absolute bottom-4 left-6 text-sm text-gray-500">
                        {currentInput.length}/500
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="conversation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-4"
                >
                  <div className="flex items-center justify-center gap-2 text-primary2">
                    <MessageCircle className="h-5 w-5" />
                    <h2 className="text-xl font-semibold text-white">
                      Let&apos;s refine your idea
                    </h2>
                  </div>
                  <p className="text-sm text-gray-400">
                    Our AI is asking follow-up questions to better understand
                    your vision
                  </p>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl mx-auto p-4 bg-gradient-to-r from-primary2/10 to-darkPrimary/10 rounded-xl border border-primary2/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-primary2" />
                      <span className="text-sm font-medium text-primary2">
                        Your Idea
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 text-left">{originalIdea || idea}</p>
                  </motion.div>
                </motion.div>

                <div className="max-w-3xl mx-auto space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {conversation.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "flex",
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] p-4 rounded-2xl",
                          message.role === "user"
                            ? "bg-gradient-to-r from-primary2 to-darkPrimary text-white"
                            : "bg-gray-800/50 text-gray-100 border border-gray-700"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {!isApproved && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto space-y-4"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary2/10 to-darkPrimary/10 rounded-xl blur-lg opacity-50" />

                      <div className="relative z-10">
                        <Textarea
                          value={currentInput}
                          onChange={(e) => handleIdeaChange(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Type your response..."
                          className={cn(
                            "min-h-[80px] text-base p-4 pr-14",
                            "bg-black/40 backdrop-blur-sm border border-white/10",
                            "rounded-xl resize-none",
                            "text-white placeholder:text-gray-500",
                            "hover:border-white/20 transition-all duration-300",
                            "focus:border-white/10 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          )}
                          disabled={isProcessing}
                          maxLength={300}
                        />

                        <motion.button
                          animate={{
                            opacity: canSubmit ? 1 : 0.3,
                            scale: canSubmit ? 1 : 0.8,
                          }}
                          whileHover={{ scale: canSubmit ? 1.05 : 0.8 }}
                          whileTap={{ scale: canSubmit ? 0.95 : 0.8 }}
                          onClick={handleSubmit}
                          disabled={!canSubmit}
                          className={cn(
                            "absolute bottom-3 right-3 w-8 h-8 rounded-full",
                            "flex items-center justify-center",
                            "bg-gradient-to-r from-primary2 to-darkPrimary",
                            "shadow-[0_0_10px_rgba(123,97,255,0.4)]",
                            "transition-all duration-300",
                            canSubmit
                              ? "hover:shadow-[0_0_15px_rgba(123,97,255,0.6)] cursor-pointer"
                              : "cursor-not-allowed"
                          )}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-3 w-3 text-white animate-spin" />
                          ) : (
                            <ArrowUp className="h-3 w-3 text-white" />
                          )}
                        </motion.button>
                      </div>
                    </div>

                    {suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-sky-400" />
                          <span className="text-sm font-medium text-sky-400">
                            Quick suggestions to help you
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {suggestions.map((suggestion, index) => (
                            <Tooltip key={index}>
                              <TooltipTrigger asChild>
                                <motion.button
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.1 }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => toggleSuggestion(suggestion)}
                                  className={cn(
                                    "group flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all duration-200",
                                    suggestion.isSelected
                                      ? "bg-gradient-to-r from-sky-500/30 to-blue-500/30 border border-sky-400/50 text-sky-200"
                                      : "bg-gradient-to-r from-sky-500/10 to-blue-500/10 border border-sky-500/20 text-sky-300 hover:from-sky-500/20 hover:to-blue-500/20 hover:border-sky-500/40"
                                  )}
                                >
                                  <Plus
                                    className={cn(
                                      "h-3 w-3 transition-transform duration-200",
                                      suggestion.isSelected
                                        ? "rotate-45"
                                        : "group-hover:rotate-90"
                                    )}
                                  />
                                  {suggestion.text}
                                  <Info className="h-3 w-3 opacity-60" />
                                </motion.button>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="max-w-[200px] bg-gray-900 border-gray-700 text-gray-200"
                              >
                                <p className="text-xs">
                                  {suggestion.description}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {isApproved && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                  >
                    <div className="flex items-center justify-center gap-2 text-green-400">
                      <CheckCircle className="h-6 w-6" />
                      <span className="text-lg font-semibold">
                        {hasNoIdea ? "Ready to Guide You!" : "Idea Approved!"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Moving to the next step...
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </TooltipProvider>
  );
}
