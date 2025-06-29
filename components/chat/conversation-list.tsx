import { useState } from "react";
import { Search, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversationItem } from "@/components/chat/conversation-item";
import { Conversation } from "@/types/chat";
import { validateSearchQuery } from "@/lib/utils/chat-validation";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  loading: boolean;
  error: string | null;
  currentUserId: string;
}

export const ConversationList = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  loading,
  error,
  currentUserId,
}: ConversationListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);

  // Handle search input with validation
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Validate search query
    const validation = validateSearchQuery(value);
    if (!validation.isValid) {
      setSearchError(validation.error);
    } else {
      setSearchError(null);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchError(null);
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      conv.title.toLowerCase().includes(query) ||
      conv.name?.toLowerCase().includes(query) ||
      conv.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={handleSearchChange}
            className={cn(
              "pl-10 pr-10 bg-darkGray border-white/10 text-white placeholder-gray-400",
              searchError && "border-red-400 focus:border-red-400"
            )}
            maxLength={100}
          />
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white p-1 border-none"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Search Error */}
        {searchError && (
          <div className="text-sm text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {searchError}
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="mx-4 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full bg-darkGray" />
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="text-gray-400 mb-2">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </div>
            <div className="text-gray-500 text-sm">
              {searchQuery ? (
                <>
                  Try a different search term or{" "}
                  <button
                    onClick={clearSearch}
                    className="text-darkPrimary hover:underline"
                  >
                    clear search
                  </button>
                </>
              ) : (
                "Conversations will appear here when you start chatting with other users"
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedConversationId}
                onClick={() => onSelectConversation(conversation.id)}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
