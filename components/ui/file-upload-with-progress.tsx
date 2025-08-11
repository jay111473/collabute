"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, File, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface FileUploadWithProgressProps {
  onFileUploaded: (mediaId: Id<"media">, fileName: string) => void;
  onFileRemoved: () => void;
  accept?: string;
  maxSize?: number; // in MB
  currentFile?: { mediaId: Id<"media">; fileName: string } | null;
  label?: string;
}

export const FileUploadWithProgress: React.FC<FileUploadWithProgressProps> = ({
  onFileUploaded,
  onFileRemoved,
  accept = ".pdf,.doc,.docx",
  maxSize = 10, // 10MB default
  currentFile,
  label = "Upload Resume/Portfolio",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{
    mediaId: Id<"media">;
    fileName: string;
  } | null>(currentFile || null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadResume = useMutation(api.users.uploadResume);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    const allowedTypes = accept.split(",").map(type => type.trim());
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      toast.error(`Only ${allowedTypes.join(", ")} files are allowed`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress (replace with actual upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file metadata to Convex
      const result = await uploadResume({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      // TODO: Implement actual file upload to storage service here
      // For now, we'll just simulate completion
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        const fileData = {
          mediaId: result.mediaId,
          fileName: file.name,
        };
        
        setUploadedFile(fileData);
        onFileUploaded(result.mediaId, file.name);
        
        toast.success("File uploaded successfully!");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file: " + error.message);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    onFileRemoved();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {!uploadedFile && !isUploading && (
        <div className="border-2 border-dashed border-grayBorders rounded-lg p-6 text-center bg-black">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">{label}</h3>
          <p className="text-gray-400 mb-4">
            Drag and drop your file here, or click to browse
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            className="border-grayBorders bg-darkGray hover:bg-darkGray2"
          >
            Choose File
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            {accept.replace(/\./g, "").toUpperCase()} files up to {maxSize}MB
          </p>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="border border-grayBorders rounded-lg p-4 bg-darkGray">
          <div className="flex items-center gap-3 mb-2">
            <File className="h-5 w-5 text-blue-400" />
            <span className="text-white text-sm">Uploading...</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-xs text-gray-400 mt-1">{uploadProgress}% complete</p>
        </div>
      )}

      {/* Uploaded File Display */}
      {uploadedFile && !isUploading && (
        <div className="border border-grayBorders rounded-lg p-4 bg-darkGray">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-white text-sm font-medium">{uploadedFile.fileName}</p>
                <p className="text-xs text-gray-400">Uploaded successfully</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
