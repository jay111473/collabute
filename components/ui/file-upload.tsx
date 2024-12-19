"use client";

import { UploadCloud, X, FileIcon, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import { Button } from "./button";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string[];
}

export function FileUpload({
  onFilesSelected,
  maxFiles = 5,
  maxSize = 10,
  acceptedTypes = [".pdf", ".doc", ".docx", ".txt", ".zip"],
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        await processFiles(droppedFiles);
        e.dataTransfer.clearData();
      }
    },
    [files]
  );

  const processFiles = async (newFiles: File[]) => {
    setIsLoading(true);
    try {
      const validFiles = newFiles.filter(file => {
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        const isValidType = acceptedTypes.some(type => 
          fileExtension === type.toLowerCase()
        );
        const isValidSize = file.size <= maxSize * 1024 * 1024;
        
        if (!isValidType) {
          console.warn(`File type not allowed: ${file.name}`);
        }
        if (!isValidSize) {
          console.warn(`File too large: ${file.name}`);
        }
        
        return isValidType && isValidSize;
      });

      if (files.length + validFiles.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFilesSelected(updatedFiles);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      await processFiles(selectedFiles);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className="w-full space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors
          ${isDragging ? "border-primary bg-primary/5" : "border-gray-200"}
          hover:border-primary hover:bg-primary/5`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          className="hidden"
          accept={acceptedTypes.join(",")}
          onChange={handleFileInput}
          id="file-upload"
        />
        <label 
          htmlFor="file-upload"
          className="flex flex-col items-center gap-2 cursor-pointer"
        >
          <UploadCloud className="h-10 w-10 text-gray-400" />
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Drag and drop files here, or{" "}
              <span className="text-primary hover:underline">browse</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Maximum {maxFiles} files. Up to {maxSize}MB each.
              <br />
              Supported formats: {acceptedTypes.join(", ")}
            </p>
          </div>
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-2 border rounded-md bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <FileIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 truncate max-w-[200px]">
                  {file.name}
                </span>
                <span className="text-xs text-gray-400">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeFile(index)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2 text-sm text-gray-600">Processing files...</span>
        </div>
      )}
    </div>
  );
} 