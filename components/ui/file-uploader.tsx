"use client";

import { useState, useCallback, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Image as ImageIcon,
  FileImage,
  Check,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface FileUploaderProps {
  onUploadComplete?: (mediaId: string, url: string) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSize?: number;
  currentImageUrl?: string;
  currentImageId?: string;
  onRemove?: () => void;
  className?: string;
  userId: string;
  disabled?: boolean;
}

interface UploadState {
  file: File | null;
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
  previewUrl: string | null;
}

export function FileUploader({
  onUploadComplete,
  onUploadError,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
  currentImageUrl,
  currentImageId,
  onRemove,
  className,
  userId,
  disabled = false,
}: FileUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    uploading: false,
    progress: 0,
    error: null,
    success: false,
    previewUrl: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const generateUploadUrl = useMutation(api.media.generateUploadUrl);
  const createMediaFromUpload = useMutation(api.media.createMediaFromUpload);

  // Get fresh URL for current image if we have an ID
  const currentMediaWithFreshUrl = useQuery(
    api.media.getMediaWithFreshUrl,
    currentImageId ? { mediaId: currentImageId as any } : "skip"
  );

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!file.type.startsWith("image/")) {
        return "Please select an image file";
      }
      if (file.size > maxSize) {
        return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`;
      }
      return null;
    },
    [maxSize]
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setUploadState((prev) => ({ ...prev, error: validationError }));
        onUploadError?.(validationError);
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      setUploadState({
        file,
        uploading: true,
        progress: 0,
        error: null,
        success: false,
        previewUrl,
      });

      try {
        // Get upload URL
        const uploadUrl = await generateUploadUrl();

        // Create XMLHttpRequest for progress tracking
        const xhr = new XMLHttpRequest();

        // Set up progress tracking
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadState((prev) => ({ ...prev, progress }));
          }
        });

        // Set up completion handler
        xhr.addEventListener("load", async () => {
          if (xhr.status === 200) {
            try {
              const result = JSON.parse(xhr.responseText);
              console.log("Upload response:", result);
              const storageId = result.storageId;
              console.log("Extracted storageId:", storageId, "type:", typeof storageId);

              // Create media record
              const mediaResult = await createMediaFromUpload({
                storageId,
                fileName: file.name,
                fileType: file.type,
                userId: userId as any,
                fileSize: file.size,
                description: `Uploaded image: ${file.name}`,
              });

              setUploadState((prev) => ({
                ...prev,
                uploading: false,
                success: true,
                progress: 100,
              }));

              onUploadComplete?.(mediaResult.mediaId, mediaResult.url);
            } catch (error) {
              console.error("Error creating media record:", error);
              setUploadState((prev) => ({
                ...prev,
                uploading: false,
                error: "Failed to save file information",
              }));
              onUploadError?.("Failed to save file information");
            }
          } else {
            setUploadState((prev) => ({
              ...prev,
              uploading: false,
              error: "Upload failed",
            }));
            onUploadError?.("Upload failed");
          }
        });

        // Set up error handler
        xhr.addEventListener("error", () => {
          setUploadState((prev) => ({
            ...prev,
            uploading: false,
            error: "Upload failed",
          }));
          onUploadError?.("Upload failed");
        });

        // Start upload
        xhr.open("POST", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      } catch (error) {
        console.error("Upload error:", error);
        setUploadState((prev) => ({
          ...prev,
          uploading: false,
          error: "Failed to start upload",
        }));
        onUploadError?.("Failed to start upload");
      }
    },
    [
      validateFile,
      generateUploadUrl,
      createMediaFromUpload,
      userId,
      onUploadComplete,
      onUploadError,
    ]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleRemoveImage = useCallback(() => {
    if (uploadState.previewUrl) {
      URL.revokeObjectURL(uploadState.previewUrl);
    }
    setUploadState({
      file: null,
      uploading: false,
      progress: 0,
      error: null,
      success: false,
      previewUrl: null,
    });
    onRemove?.();
  }, [uploadState.previewUrl, onRemove]);

  // Show current image or uploaded image - prefer fresh URL from query
  const displayImageUrl =
    uploadState.previewUrl || currentMediaWithFreshUrl?.url || currentImageUrl;
  const showImage = displayImageUrl && !uploadState.uploading;
  console.log(uploadState.previewUrl, "uploadState.previewUrl");
  console.log(currentMediaWithFreshUrl, "currentMediaWithFreshUrl");
  console.log(currentImageUrl, "currentImageUrl");
  console.log(displayImageUrl, "displayImageUrl");
  return (
    <div className={cn("space-y-4", className)}>
      {showImage ? (
        <div className="relative group">
          <div className="relative w-full h-48 bg-darkGray2 border border-grayBorders rounded-lg overflow-hidden">
            <Image
              src={displayImageUrl}
              alt="Thumbnail preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
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
          {uploadState.success && (
            <div className="absolute top-2 right-2">
              <Badge
                variant="default"
                className="bg-green-600 text-white gap-1"
              >
                <Check className="h-3 w-3" />
                Uploaded
              </Badge>
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "relative border-2 border-dashed border-grayBorders rounded-lg p-8 text-center transition-colors duration-200",
            isDragOver && !disabled && "border-blue-500 bg-blue-500/10",
            uploadState.error && "border-red-500 bg-red-500/10",
            !disabled && "hover:border-gray-400 hover:bg-darkGray2/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={disabled ? undefined : handleDragOver}
          onDragLeave={disabled ? undefined : handleDragLeave}
          onDrop={disabled ? undefined : handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploadState.uploading || disabled}
          />

          <div className="space-y-4">
            <div className="flex justify-center">
              {uploadState.uploading ? (
                <FileImage className="h-12 w-12 text-blue-500 animate-pulse" />
              ) : uploadState.error ? (
                <AlertCircle className="h-12 w-12 text-red-500" />
              ) : (
                <ImageIcon className="h-12 w-12 text-gray-400" />
              )}
            </div>

            <div className="space-y-2">
              {uploadState.uploading ? (
                <div className="space-y-2">
                  <p className="text-sm text-white font-medium">
                    Uploading... {uploadState.progress}%
                  </p>
                  <Progress
                    value={uploadState.progress}
                    className="h-2 bg-darkGray2"
                  />
                </div>
              ) : uploadState.error ? (
                <div className="space-y-2">
                  <p className="text-sm text-red-400 font-medium">
                    Upload Failed
                  </p>
                  <p className="text-xs text-red-300">{uploadState.error}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setUploadState((prev) => ({ ...prev, error: null }))
                    }
                    className="text-white border-grayBorders hover:bg-darkGray2"
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-white font-medium">
                    Drop your image here, or{" "}
                    <span className="text-blue-400 underline cursor-pointer">
                      browse
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Supports JPG, PNG, GIF up to{" "}
                    {Math.round(maxSize / (1024 * 1024))}MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
