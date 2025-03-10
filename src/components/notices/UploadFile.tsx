"use client";

import type React from "react";
import { useState, useCallback } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FileIcon, UploadIcon, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface UploadFileProps {
  type: "notice" | "reply" | "order" | "received-notice";
  noticeId: string;
  clientName: string;
  noticeHeading: string; // Main notice heading
  sectionHeading?: string; // ✅ Heading specific to reply/order/received-notice
  onFileUpload: (fileUrl: string) => void;
}

export default function UploadFile({ type, noticeId, clientName = "", noticeHeading = "", sectionHeading = "", onFileUpload }: UploadFileProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleUpload = async () => {
    if (!file) {
      toast({ variant: "destructive", title: "Error", description: "Please select a file first." });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("clientName", clientName ?? ""); 
    formData.append("noticeHeading", noticeHeading ?? "");

    // ✅ Use sectionHeading instead of prompting
    const finalHeading = (type === "reply" || type === "order" || type === "received-notice") ? sectionHeading?.trim() || "" : noticeHeading;
    if (!finalHeading) {
      toast({ variant: "destructive", title: "Error", description: "Heading is required for this document." });
      return;
    }

    formData.append("sectionHeading", finalHeading);

    try {
      const uploadResponse = await axiosInstance.post("/upload/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
      });

      const fileUrl = uploadResponse.data.fileUrl;
      if (!fileUrl) throw new Error("File upload failed.");

      console.log("✅ File uploaded successfully. URL:", fileUrl);
      onFileUpload(fileUrl);
      toast({ title: "Success", description: "File uploaded successfully." });
    } catch (error) {
      console.error("❌ File upload error:", error);
      toast({ variant: "destructive", title: "Error", description: "Upload failed. Try again." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile.type === "application/pdf") {
          setFile(droppedFile);
        } else {
          toast({
            variant: "destructive",
            title: "Invalid file type",
            description: "Please upload a PDF file.",
          });
        }
      }
    },
    [toast]
  );

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6 text-center">
          {!file ? (
            <div className="flex flex-col items-center justify-center py-4">
              <UploadIcon className="mb-2 h-10 w-10 text-muted-foreground" />
              <p className="mb-2 text-sm font-medium">Drag and drop your PDF file here or click to browse</p>
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
                className="mt-2"
              >
                Select PDF File
              </Button>
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between rounded-md bg-muted p-3">
                <div className="flex items-center space-x-3">
                  <FileIcon className="h-8 w-8 text-primary" />
                  <div className="space-y-1 text-left">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={removeFile} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2 w-full" />
                  <p className="text-xs text-muted-foreground text-center">Uploading: {uploadProgress}%</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
        {isUploading ? "Uploading..." : "Upload Document"}
      </Button>
    </div>
  );
}
