"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Media } from "@/types/convex";
import { Calendar, Users, FileText, Image, Video, Music, File, ExternalLink } from "lucide-react";

interface MediaEditDialogProps {
  media: Media | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "view" | "edit";
}

export function MediaEditDialog({ media, isOpen, onOpenChange, mode }: MediaEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: media?.description || "",
    type: media?.type || "",
  });

  const updateMedia = useMutation(api.media.update);

  const handleSave = async () => {
    if (!media || mode === "view") return;
    
    setIsLoading(true);
    try {
      await updateMedia({
        id: media._id,
        ...formData,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update media:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string | undefined) => {
    if (!type) return <File className="h-4 w-4 text-gray-400" />;
    
    const typeLower = type.toLowerCase();
    if (typeLower.includes('image') || typeLower.includes('png') || typeLower.includes('jpg') || typeLower.includes('jpeg') || typeLower.includes('gif')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    }
    if (typeLower.includes('video') || typeLower.includes('mp4') || typeLower.includes('mov') || typeLower.includes('avi')) {
      return <Video className="h-4 w-4 text-purple-500" />;
    }
    if (typeLower.includes('audio') || typeLower.includes('mp3') || typeLower.includes('wav') || typeLower.includes('music')) {
      return <Music className="h-4 w-4 text-green-500" />;
    }
    if (typeLower.includes('text') || typeLower.includes('pdf') || typeLower.includes('doc')) {
      return <FileText className="h-4 w-4 text-orange-500" />;
    }
    return <File className="h-4 w-4 text-gray-400" />;
  };

  const getTypeBadge = (type: string | undefined) => {
    if (!type) return <Badge variant="outline" className="bg-darkGray2 text-gray-300 border-grayBorders">Unknown</Badge>;
    
    const typeLower = type.toLowerCase();
    if (typeLower.includes('image') || typeLower.includes('png') || typeLower.includes('jpg') || typeLower.includes('jpeg') || typeLower.includes('gif')) {
      return <Badge variant="default" className="bg-blue-600 text-white">Image</Badge>;
    }
    if (typeLower.includes('video') || typeLower.includes('mp4') || typeLower.includes('mov') || typeLower.includes('avi')) {
      return <Badge variant="default" className="bg-purple-600 text-white">Video</Badge>;
    }
    if (typeLower.includes('audio') || typeLower.includes('mp3') || typeLower.includes('wav') || typeLower.includes('music')) {
      return <Badge variant="default" className="bg-green-600 text-white">Audio</Badge>;
    }
    if (typeLower.includes('text') || typeLower.includes('pdf') || typeLower.includes('doc')) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">Document</Badge>;
    }
    return <Badge variant="outline" className="bg-darkGray2 text-gray-300 border-grayBorders">{type}</Badge>;
  };

  const getFileExtension = (url: string) => {
    return url.split('.').pop()?.toUpperCase() || 'Unknown';
  };

  const getFileName = (url: string) => {
    return url.split('/').pop() || 'Unknown';
  };

  const formatFileSize = (url: string) => {
    // This is a placeholder since we don't have file size in the schema
    // In a real implementation, you would store and display actual file sizes
    return "Size not available";
  };

  const formatUploadDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!media) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon(media.type)}
            {mode === "view" ? "Media Details" : "Edit Media"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="meta">Metadata</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>File Name</Label>
                <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border font-mono">
                  {getFileName(media.url)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>File Type</Label>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(media.type)}
                    <div>{getTypeBadge(media.type)}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>File Extension</Label>
                  <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border">
                    {getFileExtension(media.url)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                {mode === "view" ? (
                  <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border min-h-[80px]">
                    {media.description || "No description provided"}
                  </p>
                ) : (
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-darkGray border-grayBorders text-white min-h-[80px]"
                    placeholder="Add a description for this media file..."
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>File URL</Label>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                  <a 
                    href={media.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline truncate"
                  >
                    {media.url}
                  </a>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="space-y-4">
              {(media.type?.toLowerCase().includes('image') || 
                media.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="border rounded-md p-4 bg-darkGray2">
                    <img 
                      src={media.url} 
                      alt={media.description || "Media preview"} 
                      className="max-w-full max-h-64 object-contain mx-auto rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="type">Media Type</Label>
                {mode === "view" ? (
                  <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border">
                    {media.type || "Not specified"}
                  </p>
                ) : (
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="bg-darkGray border-grayBorders text-white"
                    placeholder="image/jpeg, video/mp4, application/pdf..."
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>File Information</Label>
                <div className="bg-darkGray2 p-4 rounded-md border space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Type:</span>
                    <div>{getTypeBadge(media.type)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Extension:</span>
                    <span className="text-sm font-mono text-white">{getFileExtension(media.url)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Size:</span>
                    <span className="text-sm text-white">{formatFileSize(media.url)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Uploaded:</span>
                    <span className="text-sm text-white">{formatUploadDate(media.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Access Information</Label>
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Direct Access</span>
                  </div>
                  <p className="text-xs text-blue-700 break-all">{media.url}</p>
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(media.url, '_blank')}
                      className="text-blue-600 border-blue-300 hover:bg-darkGray2"
                    >
                      Open File
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="meta" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Uploaded By</Label>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-white">{media.userId}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload Date</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-white">
                    {formatUploadDate(media.createdAt)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Media ID</Label>
                <p className="text-xs text-gray-400 font-mono bg-darkGray2 px-2 py-1 rounded border">
                  {media._id}
                </p>
              </div>

              <div className="space-y-2">
                <Label>System Information</Label>
                <div className="bg-darkGray2 p-4 rounded-md border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Created At:</span>
                    <span className="text-white">{new Date(media._creationTime).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Uploaded At:</span>
                    <span className="text-white">{new Date(media.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">{media.type || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">User ID:</span>
                    <span className="text-white font-mono text-xs">{media.userId}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>File Details</Label>
                <div className="bg-darkGray2 p-4 rounded-md border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Filename:</span>
                    <span className="text-white font-mono text-xs">{getFileName(media.url)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Extension:</span>
                    <span className="text-white">{getFileExtension(media.url)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Has Description:</span>
                    <span className="text-white">{media.description ? "Yes" : "No"}</span>
                  </div>
                </div>
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