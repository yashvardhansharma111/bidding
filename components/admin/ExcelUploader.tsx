"use client";
import { useRef, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing/client";
import { FileSpreadsheet, Loader2, X, Download } from "lucide-react";

interface ExcelUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

export function ExcelUploader({ value, onChange }: ExcelUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("bulkExcel", {
    onClientUploadComplete: (res) => {
      onChange(res[0].ufsUrl);
      setIsUploading(false);
      setError("");
    },
    onUploadError: (err) => {
      console.error("Excel upload error:", err);
      setError(err.message || "Upload failed. Try again.");
      setIsUploading(false);
    },
    onUploadBegin: () => {
      setIsUploading(true);
      setError("");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    startUpload([file]);
    e.target.value = "";
  };

  if (value) {
    return (
      <div className="flex items-center gap-3 p-3 border-2 border-green-200 bg-green-50 rounded-lg">
        <FileSpreadsheet size={20} className="text-green-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-green-800">Excel file uploaded</p>
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-green-600 hover:underline flex items-center gap-1 mt-0.5"
          >
            <Download size={11} /> View / Download
          </a>
        </div>
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-red-400 hover:text-red-600 shrink-0 transition-colors"
          title="Remove file"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          isUploading
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : "border-gray-300 hover:border-[#2874F0] hover:bg-blue-50/30 cursor-pointer"
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={28} className="text-[#2874F0] animate-spin" />
            <p className="text-sm text-gray-500">Uploading…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <FileSpreadsheet size={28} className="text-gray-300" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                Click to upload Excel or CSV
              </p>
              <p className="text-xs text-gray-400 mt-0.5">.xlsx or .csv · max 10 MB</p>
            </div>
          </div>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
    </div>
  );
}
