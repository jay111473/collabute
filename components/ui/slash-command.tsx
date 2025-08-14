"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Editor } from "@tiptap/react";
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
} from "lucide-react";

interface SlashCommandProps {
  editor: Editor;
  range: any;
  query: string;
}

interface CommandItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  command: (props: { editor: Editor; range: any }) => void;
  searchTerms: string[];
}

export interface SlashCommandRef {
  updateProps: (props: SlashCommandProps) => void;
}

export const SlashCommand = forwardRef<SlashCommandRef, SlashCommandProps>(
  ({ editor, range, query }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [items, setItems] = useState<CommandItem[]>([]);

    const commands: CommandItem[] = [
      {
        title: "Text",
        description: "Start writing plain text",
        icon: Type,
        searchTerms: ["text", "paragraph", "p"],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).clearNodes().run();
        },
      },
      {
        title: "Heading 1",
        description: "Large section heading",
        icon: Heading1,
        searchTerms: ["heading", "h1", "title"],
        command: ({ editor, range }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setHeading({ level: 1 })
            .run();
        },
      },
      {
        title: "Heading 2",
        description: "Medium section heading",
        icon: Heading2,
        searchTerms: ["heading", "h2", "subtitle"],
        command: ({ editor, range }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setHeading({ level: 2 })
            .run();
        },
      },
      {
        title: "Heading 3",
        description: "Small section heading",
        icon: Heading3,
        searchTerms: ["heading", "h3", "subheading"],
        command: ({ editor, range }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setHeading({ level: 3 })
            .run();
        },
      },
      {
        title: "Bullet List",
        description: "Create a simple bullet list",
        icon: List,
        searchTerms: ["list", "bullet", "ul", "unordered"],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
      },
      {
        title: "Numbered List",
        description: "Create a numbered list",
        icon: ListOrdered,
        searchTerms: ["list", "numbered", "ol", "ordered"],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
      },
      {
        title: "Quote",
        description: "Create a blockquote",
        icon: Quote,
        searchTerms: ["quote", "blockquote", "citation"],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setBlockquote().run();
        },
      },
      {
        title: "Code Block",
        description: "Create a code block",
        icon: Code,
        searchTerms: ["code", "codeblock", "pre"],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setCodeBlock().run();
        },
      },
      {
        title: "Divider",
        description: "Insert a horizontal divider",
        icon: Minus,
        searchTerms: ["divider", "separator", "hr", "horizontal", "rule"],
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setHorizontalRule().run();
        },
      },
    ];

    useEffect(() => {
      const filteredItems = commands.filter((item) => {
        const searchQuery = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(searchQuery) ||
          item.description.toLowerCase().includes(searchQuery) ||
          item.searchTerms.some((term) => term.includes(searchQuery))
        );
      });

      setItems(filteredItems);
      setSelectedIndex(0);
    }, [query]);

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) {
        item.command({ editor, range });
      }
    };

    useImperativeHandle(ref, () => ({
      updateProps: (props: SlashCommandProps) => {
        // This will be called when props change
      },
    }));

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex <= 0 ? items.length - 1 : prevIndex - 1
        );
        return true;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex >= items.length - 1 ? 0 : prevIndex + 1
        );
        return true;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        selectItem(selectedIndex);
        return true;
      }

      return false;
    };

    useEffect(() => {
      document.addEventListener("keydown", onKeyDown);
      return () => {
        document.removeEventListener("keydown", onKeyDown);
      };
    }, [items, selectedIndex]);

    if (items.length === 0) {
      return (
        <div className="bg-darkGray border border-grayBorders rounded-md shadow-lg p-2 min-w-[300px]">
          <div className="px-3 py-2 text-sm text-gray-400">
            No commands found
          </div>
        </div>
      );
    }

    return (
      <div
        className="bg-darkGray border border-grayBorders rounded-md shadow-lg p-1 min-w-[300px] max-h-[400px] relative z-[9999] slash-command-menu"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#4b5563 #374151",
          overflowY: "auto",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch", // Enable smooth scrolling on webkit
          maxHeight: "400px",
          contain: "layout style paint",
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onWheel={(e) => {
          // Let the browser handle scrolling naturally
          e.stopPropagation();
        }}
      >
        {items.map((item, index) => (
          <button
            key={item.title}
            className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors duration-150 ${
              index === selectedIndex
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-darkGray2"
            }`}
            onClick={() => selectItem(index)}
          >
            <item.icon
              className={`h-4 w-4 ${
                index === selectedIndex ? "text-white" : "text-gray-400"
              }`}
            />
            <div className="flex-1 min-w-0">
              <div
                className={`font-medium text-sm ${
                  index === selectedIndex ? "text-white" : "text-white"
                }`}
              >
                {item.title}
              </div>
              <div
                className={`text-xs ${
                  index === selectedIndex ? "text-blue-100" : "text-gray-400"
                }`}
              >
                {item.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }
);

SlashCommand.displayName = "SlashCommand";
