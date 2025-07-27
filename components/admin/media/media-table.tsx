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
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Image,
  File,
  Calendar,
  ExternalLink,
  User,
} from "lucide-react";
import { MediaEditDialog } from "./media-edit-dialog";
import { Media } from "@/types/convex";

export function MediaTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [formData, setFormData] = useState({
    url: "",
    type: "",
    description: "",
    userId: "",
  });

  const media = useQuery(api.media.adminList, {}) as Media[] | undefined;
  const createMedia = useMutation(api.media.create);

  const filteredMedia = media?.filter(
    (item) =>
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.url?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeBadge = (type?: string) => {
    if (!type)
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-500 border-gray-200"
        >
          Unknown
        </Badge>
      );

    const badgeConfig = {
      "image/jpeg": {
        variant: "default" as const,
        className: "bg-green-600 text-white",
      },
      "image/jpg": {
        variant: "default" as const,
        className: "bg-green-600 text-white",
      },
      "image/png": {
        variant: "default" as const,
        className: "bg-green-600 text-white",
      },
      "image/gif": {
        variant: "default" as const,
        className: "bg-green-600 text-white",
      },
      "image/webp": {
        variant: "default" as const,
        className: "bg-green-600 text-white",
      },
      "image/svg+xml": {
        variant: "default" as const,
        className: "bg-green-600 text-white",
      },
      "video/mp4": {
        variant: "secondary" as const,
        className: "bg-purple-100 text-purple-800 border-purple-200",
      },
      "video/webm": {
        variant: "secondary" as const,
        className: "bg-purple-100 text-purple-800 border-purple-200",
      },
      "video/ogg": {
        variant: "secondary" as const,
        className: "bg-purple-100 text-purple-800 border-purple-200",
      },
      "application/pdf": {
        variant: "outline" as const,
        className: "bg-red-100 text-red-800 border-red-200",
      },
      "application/zip": {
        variant: "outline" as const,
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      "text/plain": {
        variant: "outline" as const,
        className: "bg-gray-100 text-gray-700 border-gray-300",
      },
    };

    // Check if it's an image type
    if (type.startsWith("image/")) {
      return (
        <Badge variant="default" className="bg-green-600 text-white">
          <Image className="h-3 w-3 mr-1" />
          Image
        </Badge>
      );
    }

    // Check if it's a video type
    if (type.startsWith("video/")) {
      return (
        <Badge
          variant="secondary"
          className="bg-purple-100 text-purple-800 border-purple-200"
        >
          Video
        </Badge>
      );
    }

    // Use specific config or default to file
    const config = badgeConfig[type as keyof typeof badgeConfig] || {
      variant: "outline" as const,
      className: "bg-gray-100 text-gray-700 border-gray-300",
    };

    return (
      <Badge variant={config.variant} className={config.className}>
        <File className="h-3 w-3 mr-1" />
        {type.split("/")[1]?.toUpperCase() || "File"}
      </Badge>
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateUrl = (url: string, maxLength: number = 40) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  };

  const isImageType = (type?: string) => {
    return type?.startsWith("image/") || false;
  };

  const handleViewMedia = (media: Media) => {
    setSelectedMedia(media);
    setDialogMode("view");
    setIsDetailsOpen(true);
  };

  const handleEditMedia = (media: Media) => {
    setSelectedMedia(media);
    setDialogMode("edit");
    setIsDetailsOpen(true);
  };

  const handleCreateMedia = async () => {
    if (!formData.url.trim() || !formData.userId.trim()) return;

    setIsLoading(true);
    try {
      await createMedia({
        url: formData.url.trim(),
        type: formData.type.trim() || undefined,
        description: formData.description.trim() || undefined,
        userId: formData.userId.trim() as any, // Type assertion for ID
      });

      setIsCreateOpen(false);
      setFormData({
        url: "",
        type: "",
        description: "",
        userId: "",
      });
    } catch (error) {
      console.error("Failed to create media:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <File className="h-4 w-4" />
            {filteredMedia?.length || 0} files
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Media
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="text-gray-700 font-medium px-6 py-4">
                Preview
              </TableHead>
              <TableHead className="text-gray-700 font-medium px-4 py-4">
                Description
              </TableHead>
              <TableHead className="text-gray-700 font-medium px-4 py-4">
                Type
              </TableHead>
              <TableHead className="text-gray-700 font-medium px-4 py-4">
                URL
              </TableHead>
              <TableHead className="text-gray-700 font-medium px-4 py-4">
                User ID
              </TableHead>
              <TableHead className="text-gray-700 font-medium px-4 py-4">
                Created
              </TableHead>
              <TableHead className="text-right text-gray-700 font-medium px-6 py-4">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {filteredMedia?.map((item) => (
              <TableRow
                key={item._id}
                className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150"
              >
                <TableCell className="px-6 py-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    {isImageType(item.type) ? (
                      <img
                        src={item.url}
                        alt={item.description || "Media"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const nextSibling = target.nextSibling as HTMLElement;
                          if (nextSibling) {
                            nextSibling.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full flex items-center justify-center ${isImageType(item.type) ? "hidden" : ""}`}
                    >
                      <File className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="max-w-xs">
                    <div className="font-medium text-gray-900 truncate">
                      {item.description || "No description"}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  {getTypeBadge(item.type)}
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-2 max-w-xs">
                    <span className="text-sm text-gray-700 font-mono truncate">
                      {truncateUrl(item.url)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-150"
                      onClick={() => window.open(item.url, "_blank")}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <User className="h-3 w-3" />
                    {item.userId}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <Calendar className="h-3 w-3" />
                    {formatDate(item.createdAt || item._creationTime)}
                  </div>
                </TableCell>
                <TableCell className="text-right px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-600 hover:text-blue-700 hover:bg-blue-100 transition-colors duration-150"
                      onClick={() => handleViewMedia(item)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-600 hover:text-amber-700 hover:bg-amber-100 transition-colors duration-150"
                      onClick={() => handleEditMedia(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors duration-150"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredMedia?.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No media files found
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Media File</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Media URL</Label>
              <Input
                id="url"
                placeholder="https://example.com/image.jpg"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">MIME Type</Label>
              <Input
                id="type"
                placeholder="e.g., image/jpeg, video/mp4"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                placeholder="User ID who uploaded this media"
                value={formData.userId}
                onChange={(e) =>
                  setFormData({ ...formData, userId: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Media description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-white border-gray-300 min-h-[80px]"
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
              onClick={handleCreateMedia}
              disabled={
                !formData.url.trim() || !formData.userId.trim() || isLoading
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Adding..." : "Add Media"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MediaEditDialog
        media={selectedMedia}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        mode={dialogMode}
      />
    </div>
  );
}
