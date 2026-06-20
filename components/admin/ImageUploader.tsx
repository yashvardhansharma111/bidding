"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "@uploadthing/react";
import { generateClientDropzoneAccept, generatePermittedFileTypes } from "uploadthing/client";
import { useUploadThing } from "@/lib/uploadthing/client";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

export function ImageUploader({ value, onChange, maxFiles = 8 }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload, routeConfig } = useUploadThing("auctionImages", {
    onClientUploadComplete: (res) => {
      const newUrls = res.map((f) => f.ufsUrl);
      onChange([...value, ...newUrls]);
      setIsUploading(false);
    },
    onUploadError: (err) => {
      console.error("Upload error:", err);
      setIsUploading(false);
    },
    onUploadBegin: () => setIsUploading(true),
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback(
      (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        const remaining = maxFiles - value.length;
        startUpload(acceptedFiles.slice(0, remaining));
      },
      [value.length, maxFiles, startUpload]
    ),
    accept: generateClientDropzoneAccept(
      generatePermittedFileTypes(routeConfig).fileTypes
    ),
    maxFiles: maxFiles - value.length,
    disabled: isUploading || value.length >= maxFiles,
  });

  const removeImage = (url: string) => {
    onChange(value.filter((u) => u !== url));
  };

  return (
    <div className="space-y-3">
      {/* Uploaded images grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {value.map((url, i) => (
            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={url}
                alt={`Auction image ${i + 1}`}
                fill
                className="object-contain p-1"
                sizes="120px"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-[#2874F0] text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      {value.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-[#2874F0] bg-blue-50"
              : isUploading
              ? "border-gray-200 bg-gray-50 cursor-not-allowed"
              : "border-gray-300 hover:border-[#2874F0] hover:bg-blue-50/30"
          }`}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={32} className="text-[#2874F0] animate-spin" />
              <p className="text-sm text-gray-500">Uploading to UploadThing...</p>
            </div>
          ) : isDragActive ? (
            <div className="flex flex-col items-center gap-2">
              <Upload size={32} className="text-[#2874F0]" />
              <p className="text-sm font-medium text-[#2874F0]">Drop images here</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon size={32} className="text-gray-300" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Drag & drop or <span className="text-[#2874F0]">browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  PNG, JPG, WEBP up to 4MB · {maxFiles - value.length} remaining
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {value.length >= maxFiles && (
        <p className="text-xs text-gray-400 text-center">
          Maximum {maxFiles} images reached. Remove one to upload more.
        </p>
      )}
    </div>
  );
}
