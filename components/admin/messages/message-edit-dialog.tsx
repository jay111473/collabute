"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Message } from "@/types/convex";
import {
  MessageSquare,
  Calendar,
  User,
  Hash,
  Edit3,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface MessageEditDialogProps {
  message: Message | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "view" | "edit";
}

export function MessageEditDialog({
  message,
  isOpen,
  onOpenChange,
  mode,
}: MessageEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    content: message?.content || "",
    type: message?.type || "TEXT",
    isEdited: message?.isEdited || false,
    isDeleted: message?.isDeleted || false,
  });

  const updateMessage = useMutation(api.messages.updateMessage);

  // Update form data when message changes
  useEffect(() => {
    if (message) {
      setFormData({
        content: message.content || "",
        type: message.type || "TEXT",
        isEdited: message.isEdited || false,
        isDeleted: message.isDeleted || false,
      });
    }
  }, [message]);

  const handleSave = async () => {
    if (!message || mode === "view") return;

    setIsLoading(true);
    try {
      console.log("Updating message with data:", {
        messageId: message._id,
        updates: formData,
      });

      await updateMessage({
        messageId: message._id,
        updates: {
          ...formData,
          type: formData.type as any,
        },
      });
      
      toast.success("Message updated successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update message:", error);
      
      let errorMessage = "Failed to update message";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const badgeConfig = {
      TEXT: {
        variant: "default" as const,
        className: "bg-blue-600 text-white",
      },
      IMAGE: {
        variant: "secondary" as const,
        className: "bg-purple-100 text-purple-800 border-purple-200",
      },
      FILE: {
        variant: "outline" as const,
        className: "bg-green-50 text-green-700 border-green-300",
      },
      SYSTEM: {
        variant: "destructive" as const,
        className: "bg-gray-600 text-white",
      },
    };

    const config = badgeConfig[type as keyof typeof badgeConfig] || {
      variant: "outline" as const,
      className: "bg-darkGray2 text-gray-300 border-grayBorders",
    };

    return (
      <Badge variant={config.variant} className={config.className}>
        {type}
      </Badge>
    );
  };

  const getStatusBadge = (message: Message) => {
    if (message.isDeleted) {
      return (
        <Badge variant="destructive" className="bg-red-600 text-white">
          Deleted
        </Badge>
      );
    }
    if (message.isEdited) {
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 border-yellow-200"
        >
          Edited
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-green-600 text-white">
        Active
      </Badge>
    );
  };

  if (!message) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {mode === "view" ? "Message Details" : "Edit Message"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              {mode === "view" ? (
                <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border min-h-[100px] whitespace-pre-wrap">
                  {message.content}
                </p>
              ) : (
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="bg-darkGray border-grayBorders text-white min-h-[100px]"
                  placeholder="Message content..."
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                {mode === "view" ? (
                  <div>{getTypeBadge(message.type)}</div>
                ) : (
                  <Select
                    value={formData.type}
                    onValueChange={(
                      value: "TEXT" | "IMAGE" | "FILE" | "SYSTEM"
                    ) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="bg-darkGray border-grayBorders text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEXT">Text</SelectItem>
                      <SelectItem value="IMAGE">Image</SelectItem>
                      <SelectItem value="FILE">File</SelectItem>
                      <SelectItem value="SYSTEM">System</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div>{getStatusBadge(message)}</div>
              </div>
            </div>

            {mode === "edit" && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isEdited"
                    checked={formData.isEdited}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isEdited: checked })
                    }
                  />
                  <Label htmlFor="isEdited" className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    Mark as Edited
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isDeleted"
                    checked={formData.isDeleted}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isDeleted: checked })
                    }
                  />
                  <Label
                    htmlFor="isDeleted"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Mark as Deleted
                  </Label>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Conversation ID</Label>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-white font-mono">
                    {message.conversationId}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sender ID</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-white font-mono">
                    {message.senderId}
                  </p>
                </div>
              </div>

              {message.replyToId && (
                <div className="space-y-2">
                  <Label>Reply To</Label>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-white font-mono">
                      {message.replyToId}
                    </p>
                  </div>
                </div>
              )}

              {message.editedAt && (
                <div className="space-y-2">
                  <Label>Edited At</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-white">
                      {new Date(message.editedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {message.deletedAt && (
                <div className="space-y-2">
                  <Label>Deleted At</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-white">
                      {new Date(message.deletedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Created</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-white">
                    {new Date(message._creationTime).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Message ID</Label>
                <p className="text-xs text-gray-400 font-mono bg-darkGray2 px-2 py-1 rounded border">
                  {message._id}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-white"
          >
            {mode === "view" ? "Close" : "Cancel"}
          </Button>
          {mode === "edit" && (
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
