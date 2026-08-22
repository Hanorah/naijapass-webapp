"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { FileText, Upload } from "lucide-react";

type Props = {
  accept: string;
  maxMb: number;
  hint: string;
  icon?: "cloud" | "doc" | "receipt";
  file: File | null;
  onFile: (file: File | null) => void;
};

export default function FileDropzone({
  accept,
  maxMb,
  hint,
  icon = "cloud",
  file,
  onFile,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const validate = (next: File) => {
    const maxBytes = maxMb * 1024 * 1024;
    if (next.size > maxBytes) {
      toast.error(`File must be ${maxMb}MB or smaller.`);
      return;
    }
    onFile(next);
  };

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) validate(dropped);
      }}
      className={`w-full rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
        over || file
          ? "border-orange bg-orange-soft/40"
          : "border-navy/15 bg-white hover:border-orange/40"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const next = e.target.files?.[0];
          if (next) validate(next);
        }}
      />
      <span className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-orange/10 text-forest">
        {icon === "receipt" ? (
          <FileText className="h-5 w-5" />
        ) : (
          <Upload className="h-5 w-5" />
        )}
      </span>
      {file ? (
        <>
          <p className="text-sm font-bold text-navy">{file.name}</p>
          <p className="mt-1 text-xs text-slate">
            {(file.size / 1024 / 1024).toFixed(2)} MB — click to replace
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-bold text-navy">
            Click to upload or drag and drop
          </p>
          <p className="mt-1 text-xs text-slate">{hint}</p>
        </>
      )}
    </button>
  );
}
