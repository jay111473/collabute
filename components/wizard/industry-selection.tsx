import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandEmpty,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus } from "lucide-react";
import { ALL_INDUSTRIES } from "@/utils/industries";

interface Industry {
  label: string;
  value: string;
}

interface IndustrySelectionProps {
  onIndustriesChange: (industries: string[]) => void;
  isLoading: boolean;
  suggestedIndustries: Industry[];
  selectedIndustries?: string[];
}

export function IndustrySelection({
  onIndustriesChange,
  isLoading,
  suggestedIndustries: initialSuggestedIndustries,
  selectedIndustries: initialSelectedIndustries = [],
}: IndustrySelectionProps) {
  const [suggestedIndustries, setSuggestedIndustries] = useState<Industry[]>(initialSuggestedIndustries);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(initialSelectedIndustries);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (initialSuggestedIndustries.length > 0) {
      setSuggestedIndustries(initialSuggestedIndustries);
      if (initialSelectedIndustries.length === 0) {
        // If no industries are selected, select all suggested ones
        setSelectedIndustries(initialSuggestedIndustries.map(i => i.value));
        onIndustriesChange(initialSuggestedIndustries.map(i => i.value));
      }
    }
  }, [initialSuggestedIndustries, initialSelectedIndustries, onIndustriesChange]);

  const handleIndustrySelect = (value: string) => {
    const newSelectedIndustries = selectedIndustries.includes(value)
      ? selectedIndustries.filter(i => i !== value)
      : [...selectedIndustries, value];
    setSelectedIndustries(newSelectedIndustries);
    onIndustriesChange(newSelectedIndustries);
  };

  const handleAddIndustry = (value: string) => {
    if (!selectedIndustries.includes(value)) {
      const newSelectedIndustries = [...selectedIndustries, value];
      setSelectedIndustries(newSelectedIndustries);
      onIndustriesChange(newSelectedIndustries);
    }
  };

  const availableIndustries = ALL_INDUSTRIES.filter(
    industry => !selectedIndustries.includes(industry.value)
  );

  return (
    <div className="relative min-h-[600px] flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">Select Industries</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Based on your project description, we&apos;ve identified these relevant industries. Select all that apply.
          </p>
        </div>

        <motion.div className="grid grid-cols-2 gap-6">
          {/* Show AI suggested industries */}
          {suggestedIndustries.map((industry) => (
            <motion.div
              key={industry.value}
              whileHover={{ scale: 1.02 }}
              className={cn(
                "relative group cursor-pointer p-8 rounded-2xl border-2 transition-all duration-300",
                "bg-gradient-to-br from-darkPrimary/20 to-darkPrimary/5 flex flex-col items-center justify-center min-h-[180px]",
                selectedIndustries.includes(industry.value) ? "border-primary2" : "border-white/10 hover:border-white/20"
              )}
              onClick={() => handleIndustrySelect(industry.value)}
            >
              {/* Glow Effect */}
              <div className={cn(
                "absolute inset-0 rounded-2xl transition-opacity duration-300",
                "bg-gradient-to-r from-primary2/20 to-primary/20 blur-xl",
                selectedIndustries.includes(industry.value) ? "opacity-100" : "opacity-0 group-hover:opacity-50"
              )} />

              {/* Content */}
              <div className="relative z-10 text-center">
                <h3 className="text-2xl font-semibold text-white">{industry.label}</h3>
              </div>

              {/* Selection Indicator */}
              <div className={cn(
                "absolute top-4 right-4 text-primary2",
                selectedIndustries.includes(industry.value) ? "opacity-100" : "opacity-0"
              )}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </motion.div>
          ))}

          {/* Show user-selected industries that weren't suggested by AI */}
          {ALL_INDUSTRIES.filter(industry => 
            selectedIndustries.includes(industry.value) && 
            !suggestedIndustries.some(suggested => suggested.value === industry.value)
          ).map((industry) => (
            <motion.div
              key={industry.value}
              whileHover={{ scale: 1.02 }}
              className={cn(
                "relative group cursor-pointer p-8 rounded-2xl border-2 transition-all duration-300",
                "bg-gradient-to-br from-darkPrimary/20 to-darkPrimary/5 flex flex-col items-center justify-center min-h-[180px]",
                "border-primary2"
              )}
              onClick={() => handleIndustrySelect(industry.value)}
            >
              {/* Glow Effect */}
              <div className={cn(
                "absolute inset-0 rounded-2xl transition-opacity duration-300",
                "bg-gradient-to-r from-primary2/20 to-primary/20 blur-xl opacity-100"
              )} />

              {/* Content */}
              <div className="relative z-10 text-center">
                <h3 className="text-2xl font-semibold text-white">{industry.label}</h3>
              </div>

              {/* Selection Indicator */}
              <div className="absolute top-4 right-4 text-primary2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </motion.div>
          ))}

          {/* Add Industry Button */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "relative group cursor-pointer p-8 rounded-2xl border-2 border-dashed transition-all duration-300",
                  "bg-gradient-to-br from-darkPrimary/10 to-darkPrimary/5 flex flex-col items-center justify-center min-h-[180px]",
                  "border-white/10 hover:border-white/20"
                )}
              >
                <div className="relative z-10 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary2/20 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-primary2" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Add Industry</h3>
                </div>
              </motion.div>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search industries..." />
                <CommandList>
                  <CommandEmpty>No industry found.</CommandEmpty>
                  <CommandGroup>
                    {availableIndustries.map((industry) => (
                      <CommandItem
                        key={industry.value}
                        value={industry.label}
                        onSelect={() => {
                          handleAddIndustry(industry.value);
                          setOpen(false);
                        }}
                        className="hover:bg-primary2/20"
                      >
                        {industry.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </motion.div>
      </div>

      {/* Loading Animation */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-primary2/20 rounded-full animate-ping" />
            <div className="absolute inset-0 border-4 border-t-primary2 rounded-full animate-spin" />
          </div>
        </motion.div>
      )}
    </div>
  );
}
