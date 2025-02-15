import { useState } from "react";
import { DEVELOPER_CATEGORIES } from "@/types/categories";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategorySelectorProps {
  onSelect: (categories: string[]) => void;
  maxSelections?: number;
}

export function CategorySelector({ onSelect, maxSelections = 3 }: CategorySelectorProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const newSelection = prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : prev.length < maxSelections
        ? [...prev, categoryId]
        : prev;
      
      onSelect(newSelection);
      return newSelection;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {DEVELOPER_CATEGORIES.map((category) => (
        <Card
          key={category.id}
          className={cn(
            "relative group cursor-pointer transition-all duration-200 bg-black min-h-[280px]",
            "hover:bg-zinc-900 hover:border-primary/50",
            selectedCategories.includes(category.id)
              ? "border-2 border-primary bg-zinc-900"
              : "border border-zinc-800"
          )}
          onClick={() => handleCategoryClick(category.id)}
        >
          <div className="p-8 flex flex-col h-full">
            <div className="flex items-start justify-between mb-6">
              <div className="space-y-1">
                <div className="text-gray-500 text-sm">
                  {category.id.charAt(0).toUpperCase() + category.id.slice(1)}
                </div>
                <h3 className="font-semibold text-2xl text-white group-hover:text-white">
                  {category.name}
                </h3>
              </div>
              {selectedCategories.includes(category.id) && (
                <Badge className="bg-primary text-white border-none">
                  Selected
                </Badge>
              )}
            </div>
            
            <div className="space-y-6 flex-grow">
              <p className="text-sm text-gray-400 group-hover:text-gray-300">
                {category.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {category.examples.map((example) => (
                  <div
                    key={example}
                    className="px-3 py-1 text-xs rounded-full bg-[#1E1E1E] text-gray-400 border border-zinc-800 hover:bg-[#2A2A2A] hover:text-gray-300 transition-colors"
                  >
                    {example}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 