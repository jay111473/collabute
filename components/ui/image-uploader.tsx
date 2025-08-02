"use client";

import { FormEvent, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { X, Upload, Image as ImageIcon, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImageUploaderProps {
  onUploadComplete?: (mediaId: string, url: string) => void;
  onUploadError?: (error: string) => void;
  currentImageUrl?: string;
  currentImageId?: string;
  onRemove?: () => void;
  className?: string;
  userId: string;
  disabled?: boolean;
  showDescription?: boolean;
}

export function ImageUploader({
  onUploadComplete,
  onUploadError,
  currentImageUrl,
  currentImageId,
  onRemove,
  className,
  userId,
  disabled = false,
  showDescription = false,
}: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.media.generateUploadUrl);
  const saveImage = useMutation(api.media.saveImage);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setIsUploaded(false);
    
    try {
      const postUrl = await generateUploadUrl();
      
      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      return new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });
        
        xhr.addEventListener("load", async () => {
          if (xhr.status === 200) {
            try {
              const json = JSON.parse(xhr.responseText);
              const { storageId } = json;
              
              const saveResult = await saveImage({
                storageId,
                filename: file.name,
                description: description || undefined,
                userId: userId as any,
              });
              
              setIsUploaded(true);
              toast.success("Image uploaded successfully!");
              onUploadComplete?.(saveResult.mediaId, saveResult.url);
              resolve();
            } catch (error) {
              console.error("Error saving image:", error);
              toast.error("Failed to save image");
              onUploadError?.("Failed to save image");
              reject(error);
            }
          } else {
            toast.error("Upload failed");
            onUploadError?.("Upload failed");
            reject(new Error("Upload failed"));
          }
        });
        
        xhr.addEventListener("error", () => {
          toast.error("Upload failed");
          onUploadError?.("Upload failed");
          reject(new Error("Upload failed"));
        });
        
        xhr.open("POST", postUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      onUploadError?.("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    await uploadFile(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setDescription("");
    setIsUploaded(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove?.();
  };

  const handleReplaceImage = () => {
    setSelectedFile(null);
    setDescription("");
    setIsUploaded(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const displayImageUrl = selectedFile 
    ? URL.createObjectURL(selectedFile) 
    : currentImageUrl;

  if (displayImageUrl && !selectedFile) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="relative group">
          <div className="relative w-full h-48 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
            <Image
              src={displayImageUrl}
              alt="Current image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleReplaceImage}
                  className="gap-2 bg-white/90 text-gray-900 hover:bg-white"
                >
                  <RefreshCw className="h-4 w-4" />
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="file" className="block text-sm font-medium mb-2">
            Choose Image
          </Label>
          <div className="relative">
            <Input
              ref={fileInputRef}
              type="file"
              id="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileSelect(file);
                }
              }}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              disabled={isUploading || disabled}
            />
          </div>
        </div>
        
        {selectedFile && (
          <div className="space-y-2">
            <div className="relative w-full h-48 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden group">
              <Image
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {/* Upload Progress Overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                  <div className="bg-white rounded-lg p-4 w-3/4 max-w-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Upload className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">
                        Uploading {uploadProgress}%
                      </span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                </div>
              )}
              
              {/* Success/Replace overlay */}
              {isUploaded && !isUploading && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleReplaceImage}
                    className="gap-2 bg-white/90 text-gray-900 hover:bg-white"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Replace
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
              {isUploading && (
                <span className="text-blue-600 font-medium">
                  {uploadProgress}% uploaded
                </span>
              )}
              {isUploaded && !isUploading && (
                <span className="text-green-600 font-medium">✓ Uploaded</span>
              )}
            </div>
          </div>
        )}
        
        {showDescription && selectedFile && !isUploading && (
          <div>
            <Label htmlFor="description" className="block text-sm font-medium mb-2">
              Description (optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your image..."
              className="resize-none"
              rows={3}
              disabled={disabled}
            />
          </div>
        )}
      </div>
    </div>
  );
}