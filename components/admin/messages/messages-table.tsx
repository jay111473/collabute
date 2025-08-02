"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Edit, Trash2, Search, MessageSquare, Clock, Plus } from "lucide-react";
import { Message } from "@/types/convex";
import { MessageEditDialog } from "./message-edit-dialog";

export function MessagesTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [formData, setFormData] = useState({
    senderId: "",
    receiverId: "",
    conversationId: "",
    content: "",
    type: "TEXT",
    isRead: false,
  });
  
  const messages = useQuery(api.messages.list, {}) as Message[] | undefined;
  const createMessage = useMutation(api.messages.create);

  const filteredMessages = messages?.filter((message) =>
    message.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeBadge = (type: string) => {
    const badgeConfig = {
      TEXT: { variant: "outline" as const, className: "bg-gray-100 text-gray-300 border-grayBorders" },
      IMAGE: { variant: "secondary" as const, className: "bg-blue-100 text-blue-800 border-blue-200" },
      FILE: { variant: "default" as const, className: "bg-green-600 text-white" },
      SYSTEM: { variant: "destructive" as const, className: "bg-red-600 text-white" },
    };
    
    const config = badgeConfig[type as keyof typeof badgeConfig] || { variant: "outline" as const, className: "bg-darkGray2 text-gray-300 border-grayBorders" };
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {type}
      </Badge>
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateContent = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleCreateMessage = async () => {
    if (!formData.senderId.trim() || !formData.conversationId.trim() || !formData.content.trim()) return;
    
    setIsLoading(true);
    try {
      await createMessage({
        senderId: formData.senderId.trim() as any,
        receiverId: formData.receiverId.trim() ? (formData.receiverId.trim() as any) : undefined,
        conversationId: formData.conversationId.trim() as any,
        content: formData.content.trim(),
        type: formData.type,
        isRead: formData.isRead,
      });
      
      setIsCreateOpen(false);
      setFormData({
        senderId: "",
        receiverId: "",
        conversationId: "",
        content: "",
        type: "TEXT",
        isRead: false,
      });
    } catch (error) {
      console.error("Failed to create message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setDialogMode("view");
    setIsDetailsOpen(true);
  };

  const handleEditMessage = (message: Message) => {
    setSelectedMessage(message);
    setDialogMode("edit");
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-darkGray border-grayBorders text-white placeholder-gray-400"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MessageSquare className="h-4 w-4" />
            {filteredMessages?.length || 0} messages
          </div>
          
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Message
          </Button>
        </div>
      </div>

      <div className="bg-darkGray border border-grayBorders rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-darkGray2 border-b border-grayBorders">
              <TableHead className="text-gray-300 font-medium px-6 py-4">Content</TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">Type</TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">Sender</TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">Conversation</TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">Status</TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">Date</TableHead>
              <TableHead className="text-right text-gray-300 font-medium px-6 py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-darkGray">
            {filteredMessages?.map((message) => (
              <TableRow key={message._id} className="border-b border-grayBorders hover:bg-darkGray2 transition-colors duration-150">
                <TableCell className="px-6 py-4">
                  <div className="max-w-xs">
                    <div className="font-medium text-white">
                      {truncateContent(message.content)}
                    </div>
                    {message.isEdited && (
                      <div className="text-xs text-gray-400 mt-1">
                        Edited {message.editedAt ? formatDate(message.editedAt) : ''}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">{getTypeBadge(message.type)}</TableCell>
                <TableCell className="px-4 py-4">
                  <div className="text-sm text-gray-300">
                    Sender ID: {message.senderId}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="text-sm text-gray-300">
                    {message.conversationId}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    {message.isDeleted && (
                      <Badge variant="destructive" className="text-xs bg-red-600 text-white">
                        Deleted
                      </Badge>
                    )}
                    {message.isEdited && (
                      <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                        Edited
                      </Badge>
                    )}
                    {!message.isDeleted && !message.isEdited && (
                      <Badge variant="outline" className="text-xs bg-gray-100 text-gray-300 border-grayBorders">
                        Normal
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-300">
                    <Clock className="h-3 w-3" />
                    {formatDate(message._creationTime)}
                  </div>
                </TableCell>
                <TableCell className="text-right px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-400 hover:text-blue-400 hover:bg-darkGray2 transition-colors duration-150"
                      onClick={() => handleViewMessage(message)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-400 hover:text-amber-400 hover:bg-darkGray2 transition-colors duration-150"
                      onClick={() => handleEditMessage(message)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-300 hover:bg-darkGray2 transition-colors duration-150">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredMessages?.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No messages found
        </div>
      )}
      
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Message</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senderId">Sender ID</Label>
              <Input
                id="senderId"
                placeholder="Enter sender user ID"
                value={formData.senderId}
                onChange={(e) => setFormData({ ...formData, senderId: e.target.value })}
                className="bg-darkGray border-grayBorders text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="receiverId">Receiver ID (Optional)</Label>
              <Input
                id="receiverId"
                placeholder="Enter receiver user ID"
                value={formData.receiverId}
                onChange={(e) => setFormData({ ...formData, receiverId: e.target.value })}
                className="bg-darkGray border-grayBorders text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="conversationId">Conversation ID</Label>
              <Input
                id="conversationId"
                placeholder="Enter conversation ID"
                value={formData.conversationId}
                onChange={(e) => setFormData({ ...formData, conversationId: e.target.value })}
                className="bg-darkGray border-grayBorders text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Message Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="bg-darkGray border-grayBorders text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEXT">Text</SelectItem>
                  <SelectItem value="IMAGE">Image</SelectItem>
                  <SelectItem value="FILE">File</SelectItem>
                  <SelectItem value="SYSTEM">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Message content..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="bg-darkGray border-grayBorders min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateMessage}
              disabled={!formData.senderId.trim() || !formData.conversationId.trim() || !formData.content.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Creating..." : "Create Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MessageEditDialog
        message={selectedMessage}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        mode={dialogMode}
      />
    </div>
  );
}